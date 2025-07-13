const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/reddit/:subreddit
// Fetches a list of posts from a specific subreddit.
router.get('/:subreddit', async (req, res) => {
    try {
        const { subreddit } = req.params;
        const { limit = 25 } = req.query;

        const redditApiUrl = `https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`;
        const response = await axios.get(redditApiUrl, {
            headers: { 'User-Agent': 'My App v1.0' }
        });

        const postsData = response.data.data.children;

        const cleanedPosts = postsData.map(post => {
            const { data } = post;
            let mediaUrl = null;
            let mediaType = 'none';

            // Logic to find the best image or video URL
            if (data.is_video) {
                mediaUrl = data.media?.reddit_video?.fallback_url;
                mediaType = 'video';
            } else if (data.post_hint === 'image') {
                mediaUrl = data.url;
                mediaType = 'image';
            } else if (data.preview?.images?.[0]?.source?.url) {
                mediaUrl = data.preview.images[0].source.url.replace(/&amp;/g, '&');
                mediaType = 'image';
            }

            return {
                id: data.id,
                title: data.title,
                author: data.author,
                score: data.score,
                permalink: `https://www.reddit.com${data.permalink}`,
                createdUtc: data.created_utc,
                numComments: data.num_comments,
                media: {
                    url: mediaUrl,
                    type: mediaType
                }
            };
        });

        res.status(200).json(cleanedPosts);

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "Subreddit not found." });
        }
        console.error("Failed to fetch from Reddit API:", error.message);
        res.status(500).json({ message: "Error fetching data from Reddit." });
    }
});


// GET /api/reddit/comments/:subreddit/:postId
// Fetches the comments for a single post.
router.get('/comments/:subreddit/:postId', async (req, res) => {
    try {
        const { subreddit, postId } = req.params;
        
        const commentsApiUrl = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json`;
        const response = await axios.get(commentsApiUrl, {
            headers: { 'User-Agent': 'My App v1.0' }
        });

        const commentsData = response.data[1].data.children;

        // Clean up and format the comment data
        const cleanedComments = commentsData.map(comment => {
            if (comment.kind === 't1') { // 't1' indicates a comment
                return {
                    id: comment.data.id,
                    author: comment.data.author,
                    body: comment.data.body,
                    score: comment.data.score,
                    createdUtc: comment.data.created_utc
                };
            }
        }).filter(Boolean); // Remove any undefined items (e.g., "load more" entries)

        res.status(200).json(cleanedComments);

    } catch (error) {
        console.error("Failed to fetch comments:", error.message);
        res.status(500).json({ message: "Error fetching comments." });
    }
});

module.exports = router;