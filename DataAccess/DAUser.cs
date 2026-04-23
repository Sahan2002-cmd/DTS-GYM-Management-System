// ============================================================
// DataAccess/DAUser.cs – PROCEDURE‑ONLY, NO RAW SQL
// ============================================================
using BCrypt.Net;
using GymManagement.BusinessLayer;
using GymManagement.BusinessLogic;
using GymManagement.Database_Layer;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;

namespace GymManagement.DataAccess
{
    public class DAUser : IUser
    {
        private readonly string ProcName = "GYM_USER_PROC";

        public bool IsAdmin(int userId)
        {
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new UserRequestModel { p_action_type = "006", p_user_id = userId }, ProcName);
                return res.ResultStatusCode == "1" && res.ResultDataTable.Rows.Count > 0 &&
                       res.ResultDataTable.Rows[0]["roleName"].ToString() == "Admin";
            }
        }

        public Response GetAllUsers()
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new UserRequestModel { p_action_type = "001" }, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<UserModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapUser(row));
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response GetPendingUsers()
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new UserRequestModel { p_action_type = "015" }, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    var list = new List<UserModel>();
                    foreach (DataRow row in res.ResultDataTable.Rows)
                        list.Add(MapUser(row));
                    result.ResultSet = list;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response GetUserById(int userId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new UserRequestModel { p_action_type = "002", p_user_id = userId }, ProcName);
                if (res.ResultStatusCode == "1")
                {
                    result.ResultSet = res.ResultDataTable.Rows.Count > 0 ? MapUser(res.ResultDataTable.Rows[0]) : null;
                    result.StatusCode = 200;
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        public Response AddUser(UserRequestModel req)
        {
            var result = new Response();
            req.p_action_type = "003";
            req.p_password_hash = BCrypt.Net.BCrypt.HashPassword(req.p_password_hash);

            using (var db = new DBconnect())
            {
                try
                {
                    var res = db.ProcedureRead(req, ProcName);
                    if (res.ResultStatusCode == "1")
                    {
                        result.StatusCode = 200;
                        result.Result = "Registration successful. Awaiting admin approval.";
                        result.ResultSet = null;
                        try { EmailHelper.SendWelcomeEmail(req.p_email); } catch { }
                    }
                    else
                    {
                        result.StatusCode = 400;
                        result.Result = res.ExceptionMessage ?? "Registration failed.";
                    }
                }
                catch (Exception ex)
                {
                    result.StatusCode = 500;
                    result.Result = $"System error: {ex.Message}";
                }
            }
            return result;
        }

        public Response EditUser(UserRequestModel req)
        {
            var result = new Response();
            req.p_action_type = "004";
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(req, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 400;
                result.Result = res.ResultStatusCode == "1" ? "User updated successfully." : res.ExceptionMessage;
            }
            return result;
        }

        public Response DeleteUser(int userId, int adminId)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(new UserRequestModel { p_action_type = "005", p_user_id = userId, p_admin_id = adminId }, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1" ? "User deleted." : res.ExceptionMessage;
            }
            return result;
        }

        public Response ApproveOrRejectUser(int userId, int adminId, string newStatus, int roleId, string firstName = "", string lastName = "")
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(new UserRequestModel
                {
                    p_action_type = "007",
                    p_user_id = userId,
                    p_admin_id = adminId,
                    p_new_status = newStatus,
                    p_role_id = roleId,
                    p_first_name = firstName,
                    p_last_name = lastName
                }, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1" ? $"User {newStatus}." : res.ExceptionMessage;
            }
            return result;
        }

        public Response ChangeUserStatus(int userId, int adminId, string newStatus)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(new UserRequestModel
                {
                    p_action_type = "007",
                    p_user_id = userId,
                    p_admin_id = adminId,
                    p_new_status = newStatus,
                    p_role_id = null
                }, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1" ? $"Status changed to {newStatus}." : res.ExceptionMessage;
            }
            return result;
        }

        public Response ChangeLinkedTableStatus(int userId, int adminId, string tableName, string newStatus)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(new UserRequestModel
                {
                    p_action_type = "016",
                    p_user_id = userId,
                    p_admin_id = adminId,
                    p_table_name = tableName,
                    p_new_status = newStatus
                }, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 500;
                result.Result = res.ResultStatusCode == "1" ? $"{tableName} status changed to {newStatus}." : res.ExceptionMessage;
            }
            return result;
        }

        public Response Login(string emailOrPhone, string password)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(
                    new UserRequestModel { p_action_type = "008", p_email = emailOrPhone, p_phone = emailOrPhone },
                    ProcName);

                if (res.ResultStatusCode != "1" || res.ResultDataTable.Rows.Count == 0)
                {
                    result.StatusCode = 401;
                    result.Result = "Invalid email/phone or password.";
                    return result;
                }

                var row = res.ResultDataTable.Rows[0];
                string storedHash = row["password_hash"]?.ToString();
                string userStatus = row["status"]?.ToString();

                if (string.IsNullOrEmpty(storedHash) || !BCrypt.Net.BCrypt.Verify(password, storedHash))
                {
                    result.StatusCode = 401;
                    result.Result = "Invalid email/phone or password.";
                    return result;
                }

                if (userStatus != "active")
                {
                    string msg;
                    if (userStatus == "pending")
                        msg = "Your account is pending admin approval. Please wait.";
                    else if (userStatus == "rejected")
                        msg = "Your registration was rejected. Please contact the gym.";
                    else if (userStatus == "inactive")
                        msg = "Your account is inactive. Contact the admin.";
                    else if (userStatus == "suspended")
                        msg = "Your account has been suspended. Contact the admin.";
                    else
                        msg = "Account not active. Contact support.";

                    result.StatusCode = 403;
                    result.Result = msg;
                    return result;
                }

                var user = MapUser(row);
                var token = JwtHelper.GenerateToken(user);
                result.StatusCode = 200;
                result.ResultSet = new { user, token };
            }
            return result;
        }

        public Response OAuthLogin(string provider, string providerUid, string email, string name)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new UserRequestModel
                {
                    p_action_type = "009",
                    p_provider = provider,
                    p_provider_uid = providerUid,
                    p_email = email,
                    p_username = name
                }, ProcName);
                if (res.ResultStatusCode == "1" && res.ResultDataTable.Rows.Count > 0)
                {
                    var user = MapUser(res.ResultDataTable.Rows[0]);
                    var token = JwtHelper.GenerateToken(user);
                    result.StatusCode = 200;
                    result.ResultSet = new { user, token };
                }
                else { result.StatusCode = 500; result.Result = res.ExceptionMessage; }
            }
            return result;
        }

        // ============================================================
        // FORGOT PASSWORD – DELIVERY METHOD SELECTION
        // identifier: email or phone (provided by user)
        // deliveryMethod: "sms", "email", "whatsapp"
        // ============================================================
        public Response RequestPasswordReset(string identifier, string deliveryMethod = "sms")
        {
            var result = new Response();

            using (var db = new DBconnect())
            {
                // 1. Find user by identifier (email or phone) using action 008
                var findUser = db.ProcedureRead(
                    new UserRequestModel { p_action_type = "008", p_email = identifier, p_phone = identifier },
                    ProcName);

                if (findUser.ResultStatusCode != "1" || findUser.ResultDataTable.Rows.Count == 0)
                {
                    // Security: do not reveal account existence
                    result.StatusCode = 200;
                    result.Result = "If an account exists, an OTP has been sent.";
                    return result;
                }

                var row = findUser.ResultDataTable.Rows[0];
                string userEmail = row["email"].ToString();
                string userPhone = row["phone"]?.ToString();

                // 2. Generate OTP and store via action 013 (OTP is stored against phone)
                string otp = new Random().Next(100000, 999999).ToString();
                var storeOtp = db.ProcedureExecute(new UserRequestModel
                {
                    p_action_type = "013",
                    p_phone = userPhone,
                    p_otp_code = otp
                }, ProcName);

                if (storeOtp.ResultStatusCode != "1")
                {
                    result.StatusCode = 500;
                    result.Result = "Failed to store OTP.";
                    return result;
                }

                // 3. Send OTP based on the chosen delivery method
                if (deliveryMethod == "email")
                {
                    if (string.IsNullOrEmpty(userEmail))
                    {
                        result.StatusCode = 400;
                        result.Result = "No email address is registered for this account.";
                        return result;
                    }

                    var emailResponse = EmailHelper.SendOtpEmail(userEmail, otp);
                    if (emailResponse.StatusCode == 200)
                    {
                        result.StatusCode = 200;
                        result.Result = $"OTP sent to {MaskEmail(userEmail)} via email.";
                        result.ResultSet = new { email = userEmail, masked = MaskEmail(userEmail) };
                    }
                    else
                    {
                        result.StatusCode = 500;
                        result.Result = emailResponse.Result;
                    }
                }
                else if (deliveryMethod == "whatsapp")
                {
                    if (string.IsNullOrEmpty(userPhone))
                    {
                        result.StatusCode = 400;
                        result.Result = "No phone number is registered for WhatsApp delivery.";
                        return result;
                    }

                    var waResponse = WhatsAppHelper.SendOtpViaWhatsApp(userPhone, otp);
                    if (waResponse.StatusCode == 200)
                    {
                        result.StatusCode = 200;
                        result.Result = "WhatsApp link generated. Open the link to receive your OTP.";
                        result.ResultSet = new { link = (waResponse.ResultSet as dynamic)?.link, phone = userPhone, masked = MaskPhone(userPhone) };
                    }
                    else
                    {
                        result.StatusCode = 500;
                        result.Result = waResponse.Result;
                    }
                }
                else // Default: SMS
                {
                    if (string.IsNullOrEmpty(userPhone))
                    {
                        result.StatusCode = 400;
                        result.Result = "No phone number is registered for SMS delivery.";
                        return result;
                    }

                    var smsResponse = SmsHelper.SendOtpSms(userPhone, otp);
                    if (smsResponse.StatusCode == 200)
                    {
                        result.StatusCode = 200;
                        result.Result = $"OTP sent to {MaskPhone(userPhone)} via SMS.";
                        result.ResultSet = new { phone = userPhone, masked = MaskPhone(userPhone) };
                    }
                    else
                    {
                        result.StatusCode = 500;
                        result.Result = smsResponse.Result;
                    }
                }
            }

            return result;
        }

        public Response VerifyResetCode(string phone, string code)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new UserRequestModel
                {
                    p_action_type = "014",
                    p_phone = phone,
                    p_otp_code = code
                }, ProcName);

                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 400;
                result.Result = res.ResultStatusCode == "1" ? "OTP verified." : "Invalid or expired OTP.";
            }
            return result;
        }

        public Response ResetPassword(string identifier, string code, string newPasswordPlain)
        {
            var result = new Response();
            bool isEmail = identifier.Contains("@");
            string phone = identifier;

            using (var db = new DBconnect())
            {
                if (isEmail)
                {
                    var findUser = db.ProcedureRead(
                        new UserRequestModel { p_action_type = "008", p_email = identifier },
                        ProcName);
                    if (findUser.ResultStatusCode != "1" || findUser.ResultDataTable.Rows.Count == 0)
                    {
                        result.StatusCode = 400;
                        result.Result = "Account not found.";
                        return result;
                    }
                    phone = findUser.ResultDataTable.Rows[0]["phone"]?.ToString();
                    if (string.IsNullOrEmpty(phone))
                    {
                        result.StatusCode = 400;
                        result.Result = "No phone number associated with this account.";
                        return result;
                    }
                }

                string hash = BCrypt.Net.BCrypt.HashPassword(newPasswordPlain);
                var resetRes = db.ProcedureExecute(new UserRequestModel
                {
                    p_action_type = "012",
                    p_phone = phone,
                    p_otp_code = code,
                    p_new_password = hash
                }, ProcName);

                if (resetRes.ResultStatusCode == "1")
                {
                    result.StatusCode = 200;
                    result.Result = "Password reset successful. You can now log in.";
                }
                else
                {
                    result.StatusCode = 400;
                    result.Result = resetRes.ExceptionMessage ?? "Invalid or expired OTP.";
                }
            }
            return result;
        }

        // ============================================================
        // PHONE OTP (Registration & Edit Profile)
        // ============================================================
        public Response SendPhoneOtp(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return new Response { StatusCode = 400, Result = "Phone number required." };
            string otp = new Random().Next(100000, 999999).ToString();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureExecute(new UserRequestModel { p_action_type = "013", p_phone = phone, p_otp_code = otp }, ProcName);
                if (res.ResultStatusCode != "1")
                    return new Response { StatusCode = 500, Result = res.ExceptionMessage };
            }
            return SmsHelper.SendOtpSms(phone, otp);
        }

        public Response VerifyPhoneOtp(string phone, string code)
        {
            var result = new Response();
            using (var db = new DBconnect())
            {
                var res = db.ProcedureRead(new UserRequestModel { p_action_type = "014", p_phone = phone, p_otp_code = code }, ProcName);
                result.StatusCode = res.ResultStatusCode == "1" ? 200 : 400;
                result.Result = res.ResultStatusCode == "1" ? "Phone verified." : "Invalid or expired OTP.";
            }
            return result;
        }

        public Response SendEditOtp(int userId)
        {
            var userRes = GetUserById(userId);
            if (userRes.StatusCode != 200 || !(userRes.ResultSet is UserModel u))
                return new Response { StatusCode = 404, Result = "User not found." };
            if (string.IsNullOrWhiteSpace(u.phone))
                return new Response { StatusCode = 400, Result = "No phone on file." };
            return SendPhoneOtp(u.phone);
        }

        // ============================================================
        // HELPERS
        // ============================================================
        private UserModel MapUser(DataRow row)
        {
            var u = new UserModel();
            if (row.Table.Columns.Contains("userId")) u.userId = Convert.ToInt32(row["userId"]);
            if (row.Table.Columns.Contains("email")) u.email = row["email"]?.ToString();
            if (row.Table.Columns.Contains("phone")) u.phone = row["phone"]?.ToString();
            if (row.Table.Columns.Contains("firstName")) u.firstName = row["firstName"]?.ToString();
            if (row.Table.Columns.Contains("lastName")) u.lastName = row["lastName"]?.ToString();
            if (row.Table.Columns.Contains("gender")) u.gender = row["gender"]?.ToString();
            if (row.Table.Columns.Contains("profile_image")) u.profile_image = row["profile_image"]?.ToString();
            if (row.Table.Columns.Contains("roleId")) u.roleId = Convert.ToInt32(row["roleId"]);
            if (row.Table.Columns.Contains("roleName")) u.roleName = row["roleName"]?.ToString();
            if (row.Table.Columns.Contains("status")) u.status = row["status"]?.ToString();
            if (row.Table.Columns.Contains("created_date")) u.created_date = row["created_date"]?.ToString();
            if (row.Table.Columns.Contains("updated_date")) u.updated_date = row["updated_date"]?.ToString();
            return u;
        }

        private string MaskEmail(string email)
        {
            if (string.IsNullOrEmpty(email) || !email.Contains("@")) return email;
            var parts = email.Split('@');
            string local = parts[0];
            if (local.Length <= 2) return email;
            string maskedLocal = local.Substring(0, 2) + new string('*', local.Length - 2);
            return maskedLocal + "@" + parts[1];
        }

        private string MaskPhone(string phone)
        {
            if (string.IsNullOrEmpty(phone) || phone.Length < 6) return phone;
            return phone.Substring(0, 3) + "***" + phone.Substring(phone.Length - 4);
        }
    }
}