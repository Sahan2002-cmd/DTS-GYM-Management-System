using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class TrainerAssignmentController : Controller
    {
        private readonly ITrainerAssignment _ta;
        private readonly IUser _user;

        public TrainerAssignmentController(ITrainerAssignment ta, IUser user)
        {
            _ta = ta;
            _user = user;
        }

        // GET /trainerassignment/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_ta.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /trainerassignment/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_ta.GetById(id), JsonRequestBehavior.AllowGet);

        // GET /trainerassignment/getbymember?memberId=2
        [HttpGet]
        public ActionResult GetByMember(int memberId)
            => Json(_ta.GetByMember(memberId), JsonRequestBehavior.AllowGet);

        // GET /trainerassignment/getbytrainer?trainerId=3
        [HttpGet]
        public ActionResult GetByTrainer(int trainerId)
            => Json(_ta.GetByTrainer(trainerId), JsonRequestBehavior.AllowGet);

        // POST /trainerassignment/add
        [HttpPost]
        public ActionResult Add(TrainerAssignmentRequestModel req)
        {
            // Allowed for anyone (Members request)
            return Json(_ta.Add(req));
        }

        // POST /trainerassignment/updatestatus?assignmentId=1&status=Approved&adminId=2
        [HttpPost]
        public ActionResult UpdateStatus(int assignmentId, string status, int adminId)
        {
            // Approved by Admin or the Trainer themselves
            return Json(_ta.UpdateStatus(assignmentId, status, adminId));
        }

        // POST /trainerassignment/delete?id=1&adminId=1
        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_ta.Delete(id, adminId));
        }
    }
}