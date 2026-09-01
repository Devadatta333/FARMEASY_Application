//login and register slider page
let slider=document.querySelector(".slider");
let login_slide=document.querySelector(".login");
let register_slide=document.querySelector(".register");
let formsection=document.querySelector(".form_section");

register_slide.addEventListener("click", () => {
    slider.classList.add("moveslider");
    formsection.classList.add("form_section-move");
});
login_slide.addEventListener("click", () => {
    slider.classList.remove("moveslider");
    formsection.classList.remove("form_section-move");
});


//register click page
const regBtn = document.querySelector(".reg_btn");

regBtn.addEventListener("click", async () => {

    const username =
        document.querySelector(".user_reg").value;

    const password =
        document.querySelector(".password_reg").value;

    const role =
        document.querySelector(".role_reg").value;

    try {

        const response = await fetch(
            "http://localhost:3333/api/auth/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    password,
                    role
                })
            }
        );

        const data = await response.json();

        alert(data.message);

    } catch(error) {
        console.error(error);
    }
});


//login click page
const loginBtn = document.querySelector(".login_btn");

loginBtn.addEventListener("click", async () => {

    const username =
        document.querySelector(".user_login").value;

    const password =
        document.querySelector(".password_login").value;

    try {

        const response = await fetch(
            "http://localhost:3333/api/auth/login",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username,
                    password
                })
            }
        );

        const data = await response.json();

        if(response.ok){

            localStorage.setItem(
                "token",
                data.token
            );

            alert("Login Successful");

            console.log(data.token);

        }else{
            alert(data.message);
        }

    } catch(error){
        console.error(error);
    }
});

document.getElementById("google").onclick=()=>{
window.location.href=
"http://localhost:3333/api/auth/google";
}

// //now the JWT part
// console.log(localStorage.getItem("token"));
