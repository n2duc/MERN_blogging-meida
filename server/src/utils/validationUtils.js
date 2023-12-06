// Example validation utility functions
// Add more functions based on your specific validation needs

const validateFullname = (fullname) => {
    return fullname.length >= 3;
};

const validateEmail = (email) => {
    // Add more robust email validation if needed
    return email.length > 0;
};

const validatePassword = (password) => {
    // Add more robust password validation if needed
    return password.length >= 6 && password.length <= 20;
};

export { validateFullname, validateEmail, validatePassword };
