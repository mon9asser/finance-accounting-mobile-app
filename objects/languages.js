const language = {

    en: {

        validate_login_access: "Please wait while we validate your login access.",
        required_inputs: "Please make sure that you have filled in all the required information.",
        invalid_email: "You have entered an invalid email address.",
        successful_login: "Well done! You have successfully logged in. You will be redirected to the dashboard.",
        check_internet_connection: "Something went wrong, please check your internet connection and try again.",
        login: "Login", 
        login_subtitle: "Please sign in to continue",
        forget_password: "Forget your password?",
        reset: "Reset",

    },

    ar: {
        validate_login_access: "يرجى الانتظار بينما نتحقق من صلاحية دخولك.",
        required_inputs: "يرجى التأكد من ملء جميع المعلومات المطلوبة.",
        invalid_email: "لقد أدخلت عنوان بريد إلكتروني غير صالح.",
        successful_login: "أحسنت! لقد قمت بتسجيل الدخول بنجاح. سيتم توجيهك إلى لوحة التحكم.",
        check_internet_connection: "حدث خطأ ما، يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.",
        login: "تسجيل الدخول",
        login_subtitle: "يرجى تسجيل الدخول للمتابعة",
        forget_password: "نسيت كلمة المرور؟",
        reset: "إعادة تعيين"

    }

};


let get_lang = ( name = "en" )  => {
    return language[name];
}



export {get_lang};