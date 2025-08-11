const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

// Vote on authenticity
router.post("/:id/authenticity", async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, vote } = req.body;
    const reportsCollection = req.reportsCollection;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid report ID",
      });
    }

    if (!userName || !vote) {
      return res.status(400).json({
        message: "Username and vote are required",
      });
    }

    if (!["authentic", "fake"].includes(vote)) {
      return res.status(400).json({
        message: "Vote must be 'authentic' or 'fake'",
      });
    }

    const existingReport = await reportsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!existingReport) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    const existingVoteIndex = existingReport.authenticityVotes.findIndex(
      (voteItem) => voteItem.userName === userName.trim()
    );

    let updateOperation;
    if (existingVoteIndex !== -1) {
      updateOperation = {
        $set: {
          [`authenticityVotes.${existingVoteIndex}.vote`]: vote,
          [`authenticityVotes.${existingVoteIndex}.updatedAt`]: new Date(),
          updatedAt: new Date(),
        },
      };
    } else {
      const newVote = {
        id: new ObjectId(),
        userName: userName.trim(),
        vote: vote,
        createdAt: new Date(),
      };

      updateOperation = {
        $push: { authenticityVotes: newVote },
        $set: { updatedAt: new Date() },
      };
    }

    await reportsCollection.updateOne(
      { _id: new ObjectId(id) },
      updateOperation
    );

    const updatedReport = await reportsCollection.findOne({
      _id: new ObjectId(id),
    });
    const authenticVotes = updatedReport.authenticityVotes.filter(
      (v) => v.vote === "authentic"
    ).length;
    const fakeVotes = updatedReport.authenticityVotes.filter(
      (v) => v.vote === "fake"
    ).length;
    const totalVotes = authenticVotes + fakeVotes;

    let authenticityLevel = 0;
    if (totalVotes > 0) {
      authenticityLevel = Math.round((authenticVotes / totalVotes) * 100);
    }

    // Determine verification badge condition: >= 10 votes and >= 70% authentic
    const shouldVerify = totalVotes >= 10 && authenticityLevel >= 70;

    await reportsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          authenticityLevel: authenticityLevel,
          verified: shouldVerify,
          updatedAt: new Date(),
        },
      }
    );

    res.json({
      message: "Authenticity vote recorded successfully",
      authenticityLevel: authenticityLevel,
      totalVotes: totalVotes,
    });
  } catch (error) {
    console.error("Failed to record authenticity vote:", error);
    res.status(500).json({
      message: "Error recording authenticity vote",
    });
  }
});

module.exports = router;
