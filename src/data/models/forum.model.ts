type Forum = {
    name: string;
    description: string;
    creator: string | null;
    userMask: string;
    moderatorMask: string;
    orderId: number;
};

export default Forum;