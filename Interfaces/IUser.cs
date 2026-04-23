using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface IUser
    {
        // ── Admin check ───────────────────────────────────────────────
        bool IsAdmin(int userId);

        // ── User CRUD ─────────────────────────────────────────────────
        Response GetAllUsers();
        Response GetPendingUsers();
        Response GetUserById(int userId);
        Response AddUser(UserRequestModel req);
        Response EditUser(UserRequestModel req);
        Response DeleteUser(int userId, int adminId);

        // ── Status management ─────────────────────────────────────────
        // Approve, reject, or set any status (active/inactive/suspended/pending/rejected).
        // Syncs linked Member/Trainer row when roleId = 3 or 2.
        Response ApproveOrRejectUser(int userId, int adminId, string newStatus,
                                     int roleId, string firstName = "", string lastName = "");

        // Change [User] status only — no role change.
        Response ChangeUserStatus(int userId, int adminId, string newStatus);

        // Change status in Member or Trainer linked table row only.
        // tableName = "Member" | "Trainer"
        Response ChangeLinkedTableStatus(int userId, int adminId,
                                         string tableName, string newStatus);

        // ── Auth ──────────────────────────────────────────────────────
        Response Login(string emailOrPhone, string password);
        Response OAuthLogin(string provider, string providerUid,
                            string email, string name);

        // ── Forgot Password (3-step, phone-keyed OTP) ─────────────────
        // Step 1: look up account by email → fetch registered phone from DB
        //         → store OTP in UserOtp → send SMS.
        //         Returns ResultSet.{ phone, maskedPhone }
        // In IUser.cs
        Response RequestPasswordReset(string identifier, string deliveryMethod = "sms");

        // Step 2: lightweight format check — does NOT consume OTP.
        Response VerifyResetCode(string phone, string code);

        // Step 3: verify OTP by phone, consume it, update password hash.
        Response ResetPassword(string phone, string code, string newPasswordHash);

        // ── Phone OTP — Registration ───────────────────────────────────
        // Generate + store OTP in UserOtp (action 013) → SMS it.
        Response SendPhoneOtp(string phone);

        // Verify + consume OTP (action 014).
        // Used for both registration and edit-profile confirmation.
        Response VerifyPhoneOtp(string phone, string code);

        // ── Phone OTP — Edit Profile ───────────────────────────────────
        // Look up user's registered phone → call SendPhoneOtp.
        // Returns ResultSet.{ phone, maskedPhone }
        Response SendEditOtp(int userId);
    }
}