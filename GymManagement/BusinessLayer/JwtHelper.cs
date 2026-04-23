// ============================================================
//  File : BusinessLogic/JwtHelper.cs
//  Desc : JWT Token Generation & Validation
//
//  NuGet packages needed:
//  PM> Install-Package System.IdentityModel.Tokens.Jwt
//  PM> Install-Package Microsoft.IdentityModel.Tokens
//
//  Web.config <appSettings> needed:
//    <add key="JwtSecret"        value="DTS_GYM_SECRET_KEY_MIN_32_CHARS_LONG!" />
//    <add key="JwtIssuer"        value="DTSGYM" />
//    <add key="JwtAudience"      value="DTSGYMUsers" />
//    <add key="JwtExpiryMinutes" value="1440" />
// ============================================================
using GymManagement.Models;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GymManagement.BusinessLayer
{
    public static class JwtHelper
    {
        // ── Read from Web.config ──────────────────────────────────────
        private static string Secret
            => ConfigurationManager.AppSettings["JwtSecret"];

        private static string Issuer
            => ConfigurationManager.AppSettings["JwtIssuer"];

        private static string Audience
            => ConfigurationManager.AppSettings["JwtAudience"];

        private static int ExpiryMinutes
            => int.Parse(
                ConfigurationManager.AppSettings["JwtExpiryMinutes"] ?? "1440");

        // ============================================================
        //  GENERATE TOKEN
        //  Called after successful Login or OAuthLogin
        // ============================================================
        public static string GenerateToken(UserModel user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.userId?.ToString()  ?? ""),
                new Claim(ClaimTypes.Email,          user.email                ?? ""),
                new Claim("roleId",                  user.roleId?.ToString()   ?? "3"),
                new Claim("roleName",                user.roleName             ?? "Member"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat,
                          DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                          ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                issuer: Issuer,
                audience: Audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddMinutes(ExpiryMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ============================================================
        //  VALIDATE TOKEN
        //  Returns ClaimsPrincipal if valid, null if invalid/expired
        // ============================================================
        public static ClaimsPrincipal ValidateToken(string token)
        {
            try
            {
                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret));
                var handler = new JwtSecurityTokenHandler();

                var parameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,

                    ValidateIssuer = true,
                    ValidIssuer = Issuer,

                    ValidateAudience = true,
                    ValidAudience = Audience,

                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero   // no grace period
                };

                return handler.ValidateToken(token, parameters, out _);
            }
            catch
            {
                return null;   // invalid or expired
            }
        }

        // ============================================================
        //  CONVENIENCE METHODS — read claims from token string
        // ============================================================

        // Get userId from token
        public static string GetUserIdFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }

        // Get roleId from token
        public static string GetRoleIdFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst("roleId")?.Value;
        }

        // Get roleName from token
        public static string GetRoleNameFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst("roleName")?.Value;
        }

        // Get email from token
        public static string GetEmailFromToken(string token)
        {
            var principal = ValidateToken(token);
            return principal?.FindFirst(ClaimTypes.Email)?.Value;
        }

        // Check if token belongs to Admin (roleId = 1)
        public static bool IsAdminToken(string token)
        {
            return GetRoleIdFromToken(token) == "1";
        }

        // Check if token belongs to Trainer (roleId = 2)
        public static bool IsTrainerToken(string token)
        {
            return GetRoleIdFromToken(token) == "2";
        }

        // Check if token belongs to Member (roleId = 3)
        public static bool IsMemberToken(string token)
        {
            return GetRoleIdFromToken(token) == "3";
        }

        // Check if token is expired
        public static bool IsTokenExpired(string token)
        {
            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                return jwtToken.ValidTo < DateTime.UtcNow;
            }
            catch
            {
                return true;
            }
        }

        // ============================================================
        //  JWT AUTHORIZE ATTRIBUTE
        //  Add [JwtAuthorize] on any Controller or Action
        //  to protect it — reads Bearer token from Authorization header
        // ============================================================
        // Usage :
        //   [JwtAuthorize]                    — any logged-in user
        //   [JwtAuthorize(RequiredRole = "1")] — Admin only
        //   [JwtAuthorize(RequiredRole = "2")] — Trainer only
        // ============================================================
    }

    // ================================================================
    //  JwtAuthorizeAttribute
    //  Place this class in the same file or in a separate Filters/ file
    // ================================================================
    public class JwtAuthorizeAttribute : System.Web.Mvc.ActionFilterAttribute
    {
        // Optional: "1" = Admin, "2" = Trainer, "3" = Member, null = any role
        public string RequiredRole { get; set; }

        public override void OnActionExecuting(
            System.Web.Mvc.ActionExecutingContext filterContext)
        {
            // ── Read Authorization header ─────────────────────────────
            var request = filterContext.HttpContext.Request;
            var authHeader = request.Headers["Authorization"];

            if (string.IsNullOrWhiteSpace(authHeader) ||
                !authHeader.StartsWith("Bearer "))
            {
                filterContext.Result = new System.Web.Mvc.JsonResult
                {
                    Data = new { StatusCode = 401, Message = "Unauthorized. Token missing." },
                    JsonRequestBehavior = System.Web.Mvc.JsonRequestBehavior.AllowGet
                };
                return;
            }

            // ── Extract token ─────────────────────────────────────────
            string token = authHeader.Substring("Bearer ".Length).Trim();

            // ── Validate token ────────────────────────────────────────
            var principal = JwtHelper.ValidateToken(token);
            if (principal == null)
            {
                filterContext.Result = new System.Web.Mvc.JsonResult
                {
                    Data = new { StatusCode = 401, Message = "Unauthorized. Invalid or expired token." },
                    JsonRequestBehavior = System.Web.Mvc.JsonRequestBehavior.AllowGet
                };
                return;
            }

            // ── Role check (optional) ─────────────────────────────────
            if (!string.IsNullOrWhiteSpace(RequiredRole))
            {
                var roleId = principal.FindFirst("roleId")?.Value;
                if (roleId != RequiredRole)
                {
                    filterContext.Result = new System.Web.Mvc.JsonResult
                    {
                        Data = new { StatusCode = 403, Message = "Forbidden. Insufficient role." },
                        JsonRequestBehavior = System.Web.Mvc.JsonRequestBehavior.AllowGet
                    };
                    return;
                }
            }

            // ── Store principal in HttpContext for downstream use ──────
            filterContext.HttpContext.Items["user"] = principal;

            base.OnActionExecuting(filterContext);
        }
    }
}