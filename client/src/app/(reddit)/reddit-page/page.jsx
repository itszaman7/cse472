import RedditFeed from "@/components/RedditFeed";

const page = () => {
    return (
        <div className="w-full">
            <RedditFeed subreddit="thefinals" />
        </div>
    );
};

export default page;