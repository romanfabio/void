 export function isUsername(str: string) : boolean {
    return (str.length > 0 && str.length < 50) && /[a-zA-Z0-9_]+/.test(str);
}

export function isPassword(str: string) : boolean {
    return (str.length > 8 && str.length < 72) && /(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-])./.test(str);
}

export function isForumName(str: string) : boolean {
    return (str.length > 0 && str.length < 50) && /[a-zA-Z0-9_]+/.test(str);
}

export function isForumDescription(str: string) : boolean {
    return (str.length > 0 && str.length < 255);
}

export function isPostTitle(str: string) : boolean {
    return (str.length > 0 && str.length < 255);
}

export function isPostDescription(str: string) : boolean {
    return str.length > 0;
}