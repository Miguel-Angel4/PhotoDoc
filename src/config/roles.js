export const ADMIN_EMAILS = [
    'miguelangel261106@gmail.com'
];

export const isAdminUser = (email) => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
};
