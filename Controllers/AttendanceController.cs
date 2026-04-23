using System.Web.Mvc;
using GymManagement.Interfaces;
using GymManagement.BusinessLogic;

namespace GymManagement.Controllers
{
    public class AttendanceController : Controller
    {
        private readonly IAttendance _attendance;

        public AttendanceController(IAttendance attendance)
        {
            _attendance = attendance;
        }

        // GET /attendance/getall  (Admin/Trainer)
        [HttpGet]
        public ActionResult GetAll()
        {
            return Json(_attendance.GetAll(), JsonRequestBehavior.AllowGet);
        }

        // GET /attendance/getbymember?memberId=3
        [HttpGet]
        public ActionResult GetByMember(int memberId)
        {
            return Json(_attendance.GetByMember(memberId), JsonRequestBehavior.AllowGet);
        }

        // GET /attendance/today
        [HttpGet]
        public ActionResult Today()
        {
            return Json(_attendance.GetTodayAttendance(), JsonRequestBehavior.AllowGet);
        }

        // GET /attendance/getbydaterange?dateFrom=2025-01-01&dateTo=2025-01-31
        [HttpGet]
        public ActionResult GetByDateRange(string dateFrom, string dateTo)
        {
            return Json(_attendance.GetByDateRange(dateFrom, dateTo),
                        JsonRequestBehavior.AllowGet);
        }

        // POST /attendance/checkin   — called by RFID scanner machine at gym entrance
        [HttpPost]
        public ActionResult CheckIn(int rfidId)
        {
            return Json(_attendance.CheckIn(rfidId));
        }

        // POST /attendance/checkout  — called by RFID scanner at gym exit
        [HttpPost]
        public ActionResult CheckOut(int rfidId)
        {
            return Json(_attendance.CheckOut(rfidId));
        }
    }
}
