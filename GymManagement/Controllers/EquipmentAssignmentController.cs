using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class EquipmentAssignmentController : Controller
    {
        private readonly IEquipmentAssignment _ea;
        private readonly IUser _user;

        public EquipmentAssignmentController(IEquipmentAssignment ea, IUser user)
        {
            _ea = ea;
            _user = user;
        }

        // GET /equipmentassignment/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_ea.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /equipmentassignment/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_ea.GetById(id), JsonRequestBehavior.AllowGet);

        // GET /equipmentassignment/getbyschedule?scheduleId=2
        [HttpGet]
        public ActionResult GetBySchedule(int scheduleId)
            => Json(_ea.GetBySchedule(scheduleId), JsonRequestBehavior.AllowGet);

        // GET /equipmentassignment/getbymember?memberId=3
        [HttpGet]
        public ActionResult GetByMember(int memberId)
            => Json(_ea.GetByMember(memberId), JsonRequestBehavior.AllowGet);

        // POST /equipmentassignment/add  — Admin or Trainer
        [HttpPost]
        public ActionResult Add(EquipmentAssignmentRequestModel req)
            => Json(_ea.Add(req));

        // POST /equipmentassignment/edit  — Admin or Trainer
        [HttpPost]
        public ActionResult Edit(EquipmentAssignmentRequestModel req)
            => Json(_ea.Edit(req));

        // POST /equipmentassignment/delete?id=1&adminId=1  — Admin only
        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_ea.Delete(id, adminId));
        }
    }
}