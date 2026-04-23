// ============================================================
//  File : Controllers/NotificationController.cs
//  Purpose : Admin-triggered notification endpoints
//  Endpoints:
//    GET  /notification/runexpirycheck        → check subscriptions
//    GET  /notification/runincompleteschedule → check missed sessions
// ============================================================
using GymManagement.BusinessLayer;
using GymManagement.Interfaces;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class NotificationController : Controller
    {
        private readonly IUser _user;

        public NotificationController(IUser user)
        {
            _user = user;
        }

        // GET /notification/runexpirycheck?adminId=1
        [HttpGet]
        public ActionResult RunExpiryCheck(int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." },
                            JsonRequestBehavior.AllowGet);

            SubscriptionExpiryService.CheckAndNotify();
            return Json(new { StatusCode = 200, Message = "Expiry check complete. WhatsApp notifications sent." },
                        JsonRequestBehavior.AllowGet);
        }

        // GET /notification/runincompleteschedule?adminId=1
        [HttpGet]
        public ActionResult RunIncompleteSchedule(int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized." },
                            JsonRequestBehavior.AllowGet);

            ScheduleReminderService.NotifyIncompleteSchedules();
            return Json(new { StatusCode = 200, Message = "Schedule reminder check complete." },
                        JsonRequestBehavior.AllowGet);
        }
    }
}
