
const SUPABASE_URL  = "https://nckjaruetopcadchloiu.supabase.co";
const SUPABASE_ANON = "sb_publishable_as5LX9i9sIVzC-1TsKs6rg_Dtz03rAA";
 
// ── Init Supabase client ──────────────────────────────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON);
 
// ── Helpers ───────────────────────────────────────────────
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + type;
}
 
function setLoggedIn(name) {
  sessionStorage.setItem("pethavenUser", name);
  const btn = document.getElementById("SignUp");
  if (!btn) return;
  btn.textContent = "LOG OUT";
  btn.style.backgroundColor = "#4CAF50";
  btn.style.color = "#fff";
}
 
function setLoggedOut() {
  sessionStorage.removeItem("pethavenUser");
  const btn = document.getElementById("SignUp");
  if (!btn) return;
  btn.textContent = "SIGN UP";
  btn.style.backgroundColor = "#5b4034";
  btn.style.color = "#fff";
}
 
// ── Restore session on page load ──────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  const savedUser = sessionStorage.getItem("pethavenUser");
  if (savedUser) setLoggedIn(savedUser);
 
  // ── SIGN UP button (navbar) – works on every page ──────
  const signUpBar = document.getElementById("SignUp");
  if (signUpBar) {
    signUpBar.addEventListener("click", () => {
      if (sessionStorage.getItem("pethavenUser")) {
        const confirmed = confirm("Do you want to log out?");
        if (confirmed) {
          setLoggedOut();
          window.location.href = "index.html";
        }
      } else {
        // Go to sign-up page if not on it already
        if (!window.location.pathname.endsWith("SignUp.html")) {
          window.location.href = "SignUp.html";
        }
      }
    });
  }
 
  // ── Tab switching (SignUp.html only) ───────────────────
  const tabSignUp  = document.getElementById("tabSignUp");
  const tabLogIn   = document.getElementById("tabLogIn");
  const signUpForm = document.getElementById("signUpForm");
  const logInForm  = document.getElementById("logInForm");
 
  if (tabSignUp && tabLogIn) {
    tabSignUp.addEventListener("click", () => {
      tabSignUp.classList.add("active");
      tabLogIn.classList.remove("active");
      signUpForm.style.display = "block";
      logInForm.style.display  = "none";
    });
 
    tabLogIn.addEventListener("click", () => {
      tabLogIn.classList.add("active");
      tabSignUp.classList.remove("active");
      logInForm.style.display  = "block";
      signUpForm.style.display = "none";
    });
  }
 
  // ── CREATE ACCOUNT (SignUp.html only) ──────────────────
  const createBtn   = document.getElementById("createAccountBtn");
  const signUpMsg   = document.getElementById("signUpMsg");
 
  if (createBtn) {
    const firstName   = document.getElementById("firstName");
    const lastName    = document.getElementById("lastName");
    const signUpEmail = document.getElementById("signUpEmail");
    const signUpPass  = document.getElementById("signUpPassword");
    const pet         = document.getElementById("pet");
    const terms       = document.getElementById("terms");
 
    createBtn.addEventListener("click", async () => {
      if (!firstName.value || !lastName.value || !signUpEmail.value ||
          !signUpPass.value || !pet.value || !terms.checked) {
        showMsg(signUpMsg, "⚠️ Please fill in all fields and accept the terms.", "error");
        return;
      }
 
      if (signUpPass.value.length < 8) {
        showMsg(signUpMsg, "⚠️ Password must be at least 8 characters.", "error");
        return;
      }
 
      showMsg(signUpMsg, "Creating your account…", "loading");
      createBtn.disabled = true;
 
      const { data: existing } = await db
        .from("users").select("id")
        .eq("email", signUpEmail.value).maybeSingle();
 
      if (existing) {
        showMsg(signUpMsg, "⚠️ An account with this email already exists. Try logging in.", "error");
        createBtn.disabled = false;
        return;
      }
 
      const { error } = await db.from("users").insert({
        first_name: firstName.value.trim(),
        last_name:  lastName.value.trim(),
        email:      signUpEmail.value.trim().toLowerCase(),
        password:   signUpPass.value,
        pet:        pet.value
      });
 
      if (error) {
        showMsg(signUpMsg, "❌ Something went wrong: " + error.message, "error");
        createBtn.disabled = false;
        return;
      }
 
      showMsg(signUpMsg, "✅ Account created! Welcome to PetHaven!", "success");
      setLoggedIn(firstName.value.trim());
      createBtn.disabled = false;
 
      setTimeout(() => { window.location.href = "homepage-pethaven.html"; }, 1500);
    });
  }
 
  // ── LOG IN (SignUp.html only) ──────────────────────────
  const loginBtn  = document.getElementById("loginBtn");
  const logInMsg  = document.getElementById("logInMsg");
 
  if (loginBtn) {
    const loginEmail = document.getElementById("loginEmail");
    const loginPass  = document.getElementById("loginPassword");
 
    loginBtn.addEventListener("click", async () => {
      if (!loginEmail.value || !loginPass.value) {
        showMsg(logInMsg, "⚠️ Please enter your email and password.", "error");
        return;
      }
 
      showMsg(logInMsg, "Logging in…", "loading");
      loginBtn.disabled = true;
 
      const { data: user, error } = await db
        .from("users").select("*")
        .eq("email", loginEmail.value.trim().toLowerCase())
        .maybeSingle();
 
      if (error || !user) {
        showMsg(logInMsg, "❌ No account found with that email.", "error");
        loginBtn.disabled = false;
        return;
      }
 
      if (user.password !== loginPass.value) {
        showMsg(logInMsg, "❌ Incorrect password.", "error");
        loginBtn.disabled = false;
        return;
      }
 
      showMsg(logInMsg, `✅ Welcome back, ${user.first_name}!`, "success");
      setLoggedIn(user.first_name);
      loginBtn.disabled = false;
 
      setTimeout(() => { window.location.href = "homepage-pethaven.html"; }, 1500);
    });
  }
});
 
