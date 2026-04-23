// ============================================================
//  File : BusinessLayer/SubscriptionExpiryService.cs
//  Purpose : Check for expiring/expired subscriptions and send
//            WhatsApp notifications. Call this from a scheduled
//            task (e.g., Windows Task Scheduler or Hangfire).
//
//  USAGE — call once daily (e.g., midnight):
//    await SubscriptionExpiryService.CheckAndNotifyAsync();
//  OR sync wrapper:
//    SubscriptionExpiryService.CheckAndNotify();
// ============================================================
using GymManagement.BusinessLogic;
using GymManagement.Database_Layer;
using GymManagement.Models;
using System;
using System.Data;
using System.Threading.Tasks;

namespace GymManagement.BusinessLayer
{
    public static class SubscriptionExpiryService
    {
        /// <summary>
        /// Checks all active subscriptions and sends WhatsApp alerts:
        ///   - 7 days before expiry
        ///   - 3 days before expiry
        ///   - 1 day before expiry
        ///   - On the day of expiry
        ///   - Day after expiry (already expired)
        /// </summary>
        public static async Task CheckAndNotifyAsync()
        {
            try
            {
                using (var db = new DBconnect())
                {
                    // Uses GYM_SUBSCRIPTION_PROC action "009" (see SQL below)
                    var req = new SubscriptionRequestModel { p_action_type = "009" };
                    var res = db.ProcedureRead(req, "GYM_SUBSCRIPTION_PROC");

                    if (res.ResultStatusCode != "1" || res.ResultDataTable.Rows.Count == 0)
                        return;

                    foreach (DataRow row in res.ResultDataTable.Rows)
                    {
                        try
                        {
                            string phone = GetColumnValue(row, "phone");
                            string memberName = GetColumnValue(row, "memberName");
                            string endDateStr = GetColumnValue(row, "end_date");
                            string planType = GetColumnValue(row, "planType");

                            if (string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(endDateStr))
                                continue;

                            if (!DateTime.TryParse(endDateStr, out DateTime expiry))
                                continue;

                            int daysLeft = (expiry.Date - DateTime.Today).Days;

                            // Notify on 7, 3, 1 days before AND day of AND 1 day after
                            if (daysLeft == 7 || daysLeft == 3 || daysLeft == 1 ||
                                daysLeft == 0 || daysLeft == -1)
                            {
                                await WhatsAppHelper.SendSubscriptionExpiryNotificationAsync(
                                    phone, memberName, planType,
                                    expiry.ToString("dd MMM yyyy"), daysLeft);
                            }
                        }
                        catch { /* Skip one bad row, continue others */ }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[ExpiryService] Error: {ex.Message}");
            }
        }

        // Sync wrapper for backward compatibility (call from non-async code)
        public static void CheckAndNotify()
        {
            Task.Run(async () => await CheckAndNotifyAsync()).Wait();
        }

        private static string GetColumnValue(DataRow row, string column)
        {
            return row.Table.Columns.Contains(column) ? row[column]?.ToString() : "";
        }
    }

    // Ensure this model exists (if not, add it)
    public class SubscriptionRequestModel : BaseRequestModel
    {
        public string p_action_type { get; set; }
        public int? p_subscription_id { get; set; }
        public int? p_member_id { get; set; }
        public int? p_plan_id { get; set; }
        public int? p_trainer_id { get; set; }
        public string p_start_date { get; set; }
        public string p_end_date { get; set; }
        public int? p_is_active { get; set; }
        public int? p_admin_id { get; set; }
    }
}