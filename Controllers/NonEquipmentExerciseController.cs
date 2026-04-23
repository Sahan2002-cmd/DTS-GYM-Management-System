using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class NonEquipmentExerciseController : Controller
    {
        private readonly INonEquipmentExercise _nee;
        private readonly IUser _user;

        public NonEquipmentExerciseController(INonEquipmentExercise nee, IUser user)
        {
            _nee = nee;
            _user = user;
        }

        // GET /nonequipmentexercise/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_nee.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /nonequipmentexercise/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_nee.GetById(id), JsonRequestBehavior.AllowGet);

        // GET /nonequipmentexercise/getbyschedule?scheduleId=2
        [HttpGet]
        public ActionResult GetBySchedule(int scheduleId)
            => Json(_nee.GetBySchedule(scheduleId), JsonRequestBehavior.AllowGet);

        // POST /nonequipmentexercise/add  — Admin or Trainer
        [HttpPost]
        public ActionResult Add(NonEquipmentExerciseRequestModel req)
            => Json(_nee.Add(req));

        // POST /nonequipmentexercise/edit  — Admin or Trainer
        [HttpPost]
        public ActionResult Edit(NonEquipmentExerciseRequestModel req)
            => Json(_nee.Edit(req));

        // POST /nonequipmentexercise/updatestatus
        // sub_status: pending | completed
        [HttpPost]
        public ActionResult UpdateStatus(int useId, string status)
            => Json(_nee.UpdateStatus(useId, status));

        // POST /nonequipmentexercise/delete?id=1&adminId=1  — Admin only
        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_nee.Delete(id, adminId));
        }

        // ADD this new action:
        [HttpPost]
        public ActionResult Approve(int useId, string approvalStatus, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_nee.Approve(useId, approvalStatus, adminId));
        }
    }
}
