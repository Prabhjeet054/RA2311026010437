"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
const LOG_URL = "http://20.207.122.201/evaluation-service/logs";
async function Log(stack, level, pkg, message, token) {
    try {
        const res = await fetch(LOG_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                stack,
                level,
                package: pkg,
                message,
            }),
        });
        if (!res.ok) {
            return;
        }
        const text = await res.text();
        if (!text) {
            return;
        }
        let data;
        try {
            data = JSON.parse(text);
        }
        catch {
            return;
        }
        const logID = data.logID ?? data.logId;
        if (logID !== undefined && logID !== null && logID !== "") {
            console.log(logID);
        }
    }
    catch {
        // Silent: no app-level logging on failure
    }
}
