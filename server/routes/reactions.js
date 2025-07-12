const express = require('express');
const router = express.Router();
const { ObjectId } = require("mongodb");

// Add reaction to report
router.post('/:id/reactions', async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, reactionType } = req.body;
        const reportsCollection = req.reportsCollection;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        if (!userName || !reactionType) {
            return res.status(400).json({
                message: "Username and reaction type are required"
            });
        }

        const validReactions = ['👍', '👎', '😢', '😮', '😡', '❤️'];
        if (!validReactions.includes(reactionType)) {
            return res.status(400).json({
                message: "Invalid reaction type"
            });
        }

        const existingReport = await reportsCollection.findOne({ _id: new ObjectId(id) });
        if (!existingReport) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        const existingReactionIndex = existingReport.reactions.findIndex(
            reaction => reaction.userName === userName.trim()
        );

        let updateOperation;
        if (existingReactionIndex !== -1) {
            updateOperation = {
                $set: {
                    [`reactions.${existingReactionIndex}.reactionType`]: reactionType,
                    [`reactions.${existingReactionIndex}.updatedAt`]: new Date(),
                    updatedAt: new Date()
                }
            };
        } else {
            const newReaction = {
                id: new ObjectId(),
                userName: userName.trim(),
                reactionType: reactionType,
                createdAt: new Date()
            };

            updateOperation = {
                $push: { reactions: newReaction },
                $set: { updatedAt: new Date() }
            };
        }

        await reportsCollection.updateOne(
            { _id: new ObjectId(id) },
            updateOperation
        );

        res.json({
            message: existingReactionIndex !== -1 ? "Reaction updated successfully" : "Reaction added successfully"
        });

    } catch (error) {
        console.error("Failed to add reaction:", error);
        res.status(500).json({
            message: "Error adding reaction"
        });
    }
});

// Remove reaction from report
router.delete('/:id/reactions', async (req, res) => {
    try {
        const { id } = req.params;
        const { userName } = req.body;
        const reportsCollection = req.reportsCollection;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid report ID"
            });
        }

        if (!userName) {
            return res.status(400).json({
                message: "Username is required"
            });
        }

        const result = await reportsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $pull: { reactions: { userName: userName.trim() } },
                $set: { updatedAt: new Date() }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        res.json({
            message: "Reaction removed successfully"
        });

    } catch (error) {
        console.error("Failed to remove reaction:", error);
        res.status(500).json({
            message: "Error removing reaction"
        });
    }
});

module.exports = router;