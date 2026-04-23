using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class ScheduleController : Controller
    {
        private readonly ISchedule _schedule;
        private readonly IUser _user;

        public ScheduleController(ISchedule schedule, IUser user)
        {
            _schedule = schedule;
            _user = user;
        }

        // GET /schedule/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_schedule.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /schedule/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_schedule.GetById(id), JsonRequestBehavior.AllowGet);

        // GET /schedule/getbymember?memberId=2
        [HttpGet]
        public ActionResult GetByMember(int memberId)
            => Json(_schedule.GetByMember(memberId), JsonRequestBehavior.AllowGet);

        // GET /schedule/getbytrainer?trainerId=3
        [HttpGet]
        public ActionResult GetByTrainer(int trainerId)
            => Json(_schedule.GetByTrainer(trainerId), JsonRequestBehavior.AllowGet);

        // GET /schedule/getbydate?scheduleDate=2025-06-01
        [HttpGet]
        public ActionResult GetByDate(string scheduleDate)
            => Json(_schedule.GetByDate(scheduleDate), JsonRequestBehavior.AllowGet);

        // POST /schedule/add  — Admin or Trainer
        [HttpPost]
        public ActionResult Add(ScheduleRequestModel req)
            => Json(_schedule.Add(req));

        // POST /schedule/edit  — Admin or Trainer
        [HttpPost]
        public ActionResult Edit(ScheduleRequestModel req)
            => Json(_schedule.Edit(req));

        // POST /schedule/updatestatus
        // status: Pending | Scheduled | Cancelled
        //[HttpPost]
        //public ActionResult UpdateStatus(int scheduleId, string status)
        //    => Json(_schedule.UpdateStatus(scheduleId, status));
        // REPLACE UpdateStatus action:
        [HttpPost]
        public ActionResult UpdateStatus(int scheduleId, string status, string reason = null)
        {
            return Json(_schedule.UpdateStatus(scheduleId, status, reason));
        }


        // POST /schedule/delete?id=1&adminId=1  — Admin only
        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_schedule.Delete(id, adminId));
        }
    }
}