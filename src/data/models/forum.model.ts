type Forum = {
    name: string;
    description: string;
    creator: string | null;
    userMask: string;
    moderatorMask: string;
    starred: boolean;
};

export default Forum;