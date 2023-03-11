
function Validator(options) {

    const selectRules = {};
    // hàm thực hiện validate
    function validate(inputElement, rule) {
        const formGroup = inputElement.closest('.form-group');
        const messageElement = formGroup.querySelector(options.errorSelector);

        // Lấy ra các rule của element
        const rules = selectRules[rule.selector];
        var messengerError;

        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            //Lấy ra message và kiểm tra
            messengerError = rule.test(inputElement.value);
            if (messengerError) break;
        }

        if (messengerError) {
            messageElement.textContent = messengerError;
            formGroup.classList.add('invalid');
        } else {
            messageElement.textContent = '';
            formGroup.classList.remove('invalid');
        }

        return !!messengerError;
    }

    // Hàm thực hiện khi input
    function onInputChange(inputElement, rule) {
        const formGroup = inputElement.closest('.form-group');
        const messageElement = formGroup.querySelector(options.errorSelector);
        messageElement.textContent = '';
        formGroup.classList.remove('invalid');
    }

    //lấy ra formelement cần kiểm tra
    const formElement = document.querySelector(options.form);
    if (formElement) {
        // Xử lí sự kiện khi submit
        formElement.onsubmit = (e) => {
            // loại bỏ hành động mặc định mặc định của element
            e.preventDefault();
            let isFormvalid = true;
            // lặp qua các rule và kiểm tra  validate
            options.rules.forEach(rule => {
                inputElement = formElement.querySelector(rule.selector);
                const checkError = validate(inputElement, rule);
                if (checkError) {
                    isFormvalid = false;
                }
            })
            // kiểm tra xem có lỗi khi submit hay không
            if (isFormvalid) {
                // Sắp mit với javascript
                if (typeof options.onSubmit === 'function') {
                    //Lấy ra tất cả thẻ có name và ko có disabled trong form
                    let elementInputs = formElement.querySelectorAll('[name]:not([disabled');
                    // convert element sang array sau đó dùng reduce lấy ra một object
                    let formValues = Array.from(elementInputs).reduce((values, inputElement) => {
                        switch (inputElement.type) {
                            case 'radio':
                                if (inputElement.checked) {
                                    values[inputElement.name] = inputElement.value;
                                }
                                break;
                            case 'checkbox':
                                if (inputElement.checked) {
                                    if (values[inputElement.name]) {
                                        values[inputElement.name].push(inputElement.value);
                                    } else {
                                        values[inputElement.name] = [inputElement.value];
                                    }
                                }
                                break;
                            case 'file':
                                values[inputElement.name] = inputElement.files;
                            break;
                            default:
                                values[inputElement.name] = inputElement.value;
                        }
                        return values;
                    }, {});
                    //Trả dữ liệu về submit
                    options.onSubmit(formValues);
                }
                //Submit với html
                else {
                    formElement.submit();
                }
            }
        }

        // Lặp qua các rule và xử lí lắng nghe sự kiện
        options.rules.forEach(rule => {
            //Lưu lại các rule cho mỗi input
            if (Array.isArray(selectRules[rule.selector])) {
                selectRules[rule.selector].push(rule);
            } else {
                selectRules[rule.selector] = [rule]
            }
            // Lấy ra element Input và thực thi các hành động
            const inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                // khi thực thi hành động Blur
                inputElement.addEventListener('blur', () => {
                    validate(inputElement, rule);
                })

                // Xử lí mỗi khi người dùng nhập vào input
                inputElement.addEventListener('input', () => {
                    onInputChange(inputElement, rule);
                })
            }
        });
    }

}

//định nghĩa Rules

// định nghĩa khi không nhập
Validator.isRequired = (selector, message) => {
    return {
        selector,
        test(value) {

            return value.trim() ? undefined : message || 'Vui lòng nhập thông tin';
        }
    }
}
// định nghĩa email
Validator.isEmail = (selector) => {
    return {
        selector,
        test(value) {
            const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập đúng định dạng email';
        }
    }
}
// định nghĩa pasword
Validator.isPassword = (selector, message) => {
    return {
        selector,
        test(value) {
            const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
            return regex.test(value) ? undefined : 'Vui lòng nhập mật khẩu tối thiểu sáu ký tự, ít nhất một chữ cái và một số';
        }
    }
}
// định nghĩa kiểm tra nhập lại
Validator.isConfirmed = (selector, confirmValue, message) => {
    return {
        selector,
        test(value) {
            return value === confirmValue() ? undefined : message || 'Giá trị nhập vào không đúng';
        }
    }
}
