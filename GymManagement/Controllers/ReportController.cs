using GymManagement.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class ReportController : Controller
    {
        private readonly IReport _report;
        private readonly IUser _user;

        public ReportController(IReport report, IUser user)
        {
            _report = report;
            _user = user;
        }

        private bool CheckAdmin(int adminId) => _user.IsAdmin(adminId);

        // GET /report/members?dateFrom=&dateTo=&adminId=1
        [HttpGet]
        public ActionResult Members(int adminId, string dateFrom = null, string dateTo = null)
        {
            if (!CheckAdmin(adminId)) return Json(new { StatusCode = 403 });
            return Json(_report.MemberReport(dateFrom, dateTo), JsonRequestBehavior.AllowGet);
        }

        // GET /report/trainers?dateFrom=&dateTo=&adminId=1
        [HttpGet]
        public ActionResult Trainers(int adminId, string dateFrom = null, string dateTo = null)
        {
            if (!CheckAdmin(adminId)) return Json(new { StatusCode = 403 });
            return Json(_report.TrainerReport(dateFrom, dateTo), JsonRequestBehavior.AllowGet);
        }

        // GET /report/users?dateFrom=&dateTo=&adminId=1
        [HttpGet]
        public ActionResult Users(int adminId, string dateFrom = null, string dateTo = null)
        {
            if (!CheckAdmin(adminId)) return Json(new { StatusCode = 403 });
            return Json(_report.UserReport(dateFrom, dateTo), JsonRequestBehavior.AllowGet);
        }

        // GET /report/attendance?memberId=&dateFrom=&dateTo=&adminId=1
        [HttpGet]
        public ActionResult Attendance(int adminId, int? memberId = null,
                                       string dateFrom = null, string dateTo = null)
        {
            if (!CheckAdmin(adminId)) return Json(new { StatusCode = 403 });
            return Json(_report.AttendanceReport(memberId, dateFrom, dateTo),
                        JsonRequestBehavior.AllowGet);
        }

        // GET /report/subscriptions?adminId=1
        [HttpGet]
        public ActionResult Subscriptions(int adminId, string dateFrom = null, string dateTo = null)
        {
            if (!CheckAdmin(adminId)) return Json(new { StatusCode = 403 });
            return Json(_report.SubscriptionReport(dateFrom, dateTo), JsonRequestBehavior.AllowGet);
        }

        // GET /report/payments?adminId=1
        [HttpGet]
        public ActionResult Payments(int adminId, string dateFrom = null, string dateTo = null)
        {
            if (!CheckAdmin(adminId)) return Json(new { StatusCode = 403 });
            return Json(_report.PaymentReport(dateFrom, dateTo), JsonRequestBehavior.AllowGet);
        }

        // GET /report/exportpdf?type=member&dateFrom=&dateTo=&adminId=1
        [HttpGet]
        public ActionResult ExportPdf(int adminId, string type,
                                      string dateFrom = null, string dateTo = null,
                                      int? memberId = null)
        {
            if (!CheckAdmin(adminId)) return Json(new { StatusCode = 403 });
            return Json(_report.ExportToPdf(type, dateFrom, dateTo, memberId),
                        JsonRequestBehavior.AllowGet);
        }
    }
}