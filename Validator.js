


class Validator {
    constructor(formID) {
        this.form = document.getElementById(formID);
        this.fields = {};
        this.successMessage = "Submitted";
        this.passwordRequirements = {
            lowercase: /[a-z]/,
            uppercase: /[A-Z]/,
            number: /\d/,
            specialChar: /[@%*#$-_=]/,
            length: /.{8,}/
        };
        this.password = false;

        this.setupListeners();

        this.clearPassword('password1');
        this.clearPassword('password2');

    }

    clearPassword(fieldName) {
       const passwordField = this.form.querySelector(`[name="${fieldName}"]`);
        if (passwordField) {
            passwordField.value = '';
        }
    }



    // Method to add validation to input fields
    validate(inputName, dataType, min = 0, max = 0) {
        const input = this.form.querySelector(`[name="${inputName}"]`);
        if (input) {
            this.fields[inputName] = { dataType, min, max };
            input.addEventListener('input', () => this.checkField(inputName));

        }
    }

    // Real-time validation function
    checkField(inputName) {
        const input = this.form.querySelector(`[name="${inputName}"]`);
        const { dataType, min, max } = this.fields[inputName];
        const value = input.value.trim();
        let errorMessage = "";

        if (min > 0 && value.length === 0) {
            errorMessage = `${inputName} is required.`;
        } else if (value.length < min && dataType !== 'date') {
            errorMessage = `Minimum length is ${min} characters.`;
        } else if (max > 0 && value.length > max) {
            errorMessage = `Maximum length is ${max} characters.`;
        } else if (dataType === 'date' && !this.validateDate(value, min, max)) {
            if (min && max) {
                errorMessage = `Date must be between ${min} to ${max}.`;
            } else if (min) {
                errorMessage = `Date must be after ${min}.`;
            } else if (max) {
                errorMessage = `Date must be before ${max}.`;
            } else {
                errorMessage = `Invalid date Format.`;
            }
        } else if (value.length > 0 && !this.validateType(value, dataType, min, max)) {
            errorMessage = `Invalid ${dataType} format.`;
        }



        this.displayError(input, errorMessage);
        return !errorMessage;
    }

    // Function to validate different data types
    validateType(value, type, min, max) {
        switch (type) {
            case 'text':
                return !/<[a-z][\s\S]*>/i.test(value);
            case 'alpha':
                return /^[a-zA-Z\s]+$/.test(value);
            case 'alphaNum':
                return /^[a-zA-Z0-9\s]+$/.test(value);
            case 'num':
                return /^\d+$/.test(value);
            case 'email':
                return /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value);
            case 'url':
                return /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,6}([\/?].*)?$/.test(value);
            case 'date':
                return this.validateDate(value, min, max);
            case 'html':
                return true;
            default:
                return false;
        }
    }


    validateDate(value, min, max) {
        const datePattern = /^(\d{2})(\d{2})(\d{4})$/;
        if (!datePattern.test(value)) {
            return false;
        }

        const [, day, month, year] = value.match(datePattern);
        const date = new Date(`${year}-${month}-${day}`);

        if (date.getDate() != day || date.getMonth() + 1 != month || date.getFullYear() != year) {
            return false;
        }

        const minDate = min ? new Date(`${min.slice(4)}-${min.slice(2, 4)}-${min.slice(0, 2)}`) : null;
        const maxDate = max ? new Date(`${max.slice(4)}-${max.slice(2, 4)}-${max.slice(0, 2)}`) : null;

        if (minDate && date < minDate) {
            return false;

        }
        if (maxDate && date > maxDate) {
            return false;

        }

        return true;
    }

    // Function to display error message
    displayError(input, message) {
        let errorElement = input.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = message;
        } else {
            errorElement = document.createElement('div');
            errorElement.classList.add('error-message');
            errorElement.textContent = message;
            input.parentNode.insertBefore(errorElement, input.nextSibling);
        }
    }


    // Function to clear error messages
    clearErrors() {
        const errorElements = this.form.querySelectorAll('.error-message');
        errorElements.forEach(element => element.remove());
    }

    // Function to set up form submission listener
    setupListeners() {
        this.form.addEventListener('submit', (e) => {
            this.clearErrors();

            let isValid = true;


            // Validate all fields
            Object.keys(this.fields).forEach((inputName) => {
                if (!this.checkField(inputName)) {
                    isValid = false;
                }
            });

            // Validate password fields
            if (this.password && !this.validatePassword('password1', 'password2', 8, 'aA')) {
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
            } else {
                this.displaySuccess();
                this.clearFields();
                this.clearErrors();
                this.clearPasswordStatus();

                e.preventDefault();
            }
        });

        const passwordInput = this.form.querySelector('[name="password1"]');
        if (passwordInput) {
            passwordInput.addEventListener('input', () => {
                this.checkPasswordRequirements(passwordInput.value);
                document.querySelector('.password-requirements').style.display = 'block';
            });
            this.createPassword();
        }
    }

    // Function to display success message
    displaySuccess() {
        const successElement = document.createElement('div');
        successElement.classList.add('success-message');
        successElement.textContent = this.successMessage;
        this.form.appendChild(successElement);

        setTimeout(() => {
            successElement.remove();
        }, 5000);
    }

    // Function to clear form fields
    clearFields() {
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type !== 'submit' && input.type !== 'hidden'); {
                input.value = '';
            }
        });
    }

    // Function to validate password fields
    validatePassword(input1, input2, min = 8, policy = "free") {
        this.password = true;
        const pass1 = this.form.querySelector(`[name="${input1}"]`);
        const pass2 = this.form.querySelector(`[name="${input2}"]`);

        this.updatePasswordRequirenments(policy);

        let valid = true;

        const pass1Value = pass1.value.trim();

        if (pass1Value.length === 0) {
            this.displayError(pass1, `Pasaword is required.`);
            valid = false;
        } else if (pass1.value.length < min) {
            this.displayError(pass1, `Password must be at least ${min} characters long.`);
            valid = false;
        }

        //Password policy checks

        if (policy.includes('a') && !/[a-z]/.test(pass1.value)) {
            this.displayError(pass1, 'Password must contain at least one lowercase letter.');
            valid = false;
        }

        if (policy.includes('A') && !/[A-Z]/.test(pass1.value)) {
            this.displayError(pass1, 'Password must contain at least one uppercase letter.');
            valid = false;
        }

        if (policy.includes('1') && !/\d/.test(pass1.value)) {
            this.displayError(pass1, 'Password must contain at least one number.');
            valid = false;
        }

        if (policy.includes('#') && !/[@%*#$-_=]/.test(pass1.value)) {
            this.displayError(pass1, 'Password must contain at least one special Character.');
            valid = false;
        }



        //Password confirmation check
        if (pass1.value !== pass2.value) {
            this.displayError(pass2, 'Passwords do not match.');
            valid = false;
        }

        if (valid) {
            this.clearErrors();
        }

        return valid;
    }

    createPassword() {
        const passwordRequirementsList = document.createElement('ul');
        passwordRequirementsList.classList.add('password-requirements');
        const requirements = {
            lowercase: 'At least one <b>lowercase</b> letter',
            uppercase: 'At least one <b>uppercase</b> letter',
            number: 'At least one <b>number</b>',
            specialChar: 'At least one <b>special (@%*#$-_=)</b>characters',
            length: 'Minimum <b>8 characters</b>'
        };

         Object.keys(requirements).forEach(req => {
            const listItem = document.createElement('li');
            listItem.innerHTML = requirements[req];
            listItem.id = req;
            passwordRequirementsList.appendChild(listItem);
        });
        const passwordInput = document.getElementById('password1');
        passwordInput.parentNode.insertBefore(passwordRequirementsList, passwordInput.nextSibling);

        passwordRequirementsList.style.display = 'none';
        const passwordFields = this.form.querySelectorAll('input[type="password"]');
        passwordFields.forEach(field => {
            field.addEventListener('focus', () => {

                passwordFields.forEach(f => {
                    if (f !== field) {
                        const requirementsList = f.parentElement.querySelector('.password-requirements');
                        if (requirementsList) {
                            requirementsList.style.display = 'none';
                        }
                    }
                });

                const requirementsList = field.parentElement.querySelector('.password-requirements');
                if (requirementsList) {
                    requirementsList.style.display = 'block';
                }
            });

            field.addEventListener('blur', () => {
                const requirementsList = field.parentElement.querySelector('.password-requirements');
                if (requirementsList) {
                    requirementsList.style.display = 'none';
                }
            });
        });
    }

    // Function to check password requirements
    checkPasswordRequirements(value) {
        const requirements = Object.keys(this.passwordRequirements);
        requirements.forEach(req => {
            const element = document.getElementById(req);
            if (this.passwordRequirements[req].test(value)) {
                element.classList.add('valid');
            } else {
                element.classList.remove('valid');
            }
        });
    }

    clearPasswordStatus() {
        const requirements = Object.keys(this.passwordRequirements);
        requirements.forEach(req => {
            const element = document.getElementById(req);
            if (element) {
                element.classList.remove('valid');
            }
        });
        document.querySelector('.password-requirements').style.display = 'none';
    }



    updatePasswordRequirenments(policy) {
        const requirements = document.querySelectorAll('.password-requirements li');
        requirements.forEach(requirement => requirement.style.display = 'none');
        if (policy.includes('a')) {
            document.getElementById('lowercase').style.display = 'block';
        }
        if (policy.includes('A')) {
            document.getElementById('uppercase').style.display = 'block';
        }
        if (policy.includes('1')) {
            document.getElementById('number').style.display = 'block';
        }
        if (policy.includes('#')) {
            document.getElementById('specialChar').style.display = 'block';
        }
        document.getElementById('length').style.display = 'block';
    }


}

