// ============================================================
//  File : Controllers/TrainerAttendanceController.cs
// ============================================================
using GymManagement.Interfaces;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class TrainerAttendanceController : Controller
    {
        private readonly ITrainerAttendance _trainerAttendance;

        public TrainerAttendanceController(ITrainerAttendance trainerAttendance)
        {
            _trainerAttendance = trainerAttendance;
        }

        // GET /trainerattendance/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_trainerAttendance.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /trainerattendance/getbytrainer?trainerId=2
        [HttpGet]
        public ActionResult GetByTrainer(int trainerId)
            => Json(_trainerAttendance.GetByTrainer(trainerId), JsonRequestBehavior.AllowGet);

        // GET /trainerattendance/today
        [HttpGet]
        public ActionResult Today()
            => Json(_trainerAttendance.GetTodayAttendance(), JsonRequestBehavior.AllowGet);

        // GET /trainerattendance/getbydaterange?dateFrom=2026-01-01&dateTo=2026-01-31
        [HttpGet]
        public ActionResult GetByDateRange(string dateFrom, string dateTo)
            => Json(_trainerAttendance.GetByDateRange(dateFrom, dateTo),
                    JsonRequestBehavior.AllowGet);

        // POST /trainerattendance/checkin?trainerId=2
        [HttpPost]
        public ActionResult CheckIn(int trainerId)
            => Json(_trainerAttendance.CheckIn(trainerId));

        // POST /trainerattendance/checkout?trainerId=2
        [HttpPost]
        public ActionResult CheckOut(int trainerId)
            => Json(_trainerAttendance.CheckOut(trainerId));
    }
}
