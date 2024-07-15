function showFirstForm() {
    document.getElementById("firstForm").style.display = "block";
    document.getElementById("secondForm").style.display = "none";
    document.getElementById("thirdForm").style.display = "none";
}

function showSecondForm() {
    document.getElementById("firstForm").style.display = "none";
    document.getElementById("secondForm").style.display = "block";
    document.getElementById("thirdForm").style.display = "none";
}

function showThirdForm() {
    document.getElementById("firstForm").style.display = "none";
    document.getElementById("secondForm").style.display = "none";
    document.getElementById("thirdForm").style.display = "block";
}
