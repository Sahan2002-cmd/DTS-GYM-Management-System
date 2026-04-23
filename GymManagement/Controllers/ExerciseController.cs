using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class ExerciseController : Controller
    {
        private readonly IExercise _exercise;
        private readonly IUser _user;

        public ExerciseController(IExercise exercise, IUser user)
        {
            _exercise = exercise;
            _user = user;
        }

        // GET /exercise/getall  — Admin and Trainer (can export PDF)
        [HttpGet]
        public ActionResult GetAll()
            => Json(_exercise.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /exercise/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_exercise.GetById(id), JsonRequestBehavior.AllowGet);

        // POST /exercise/add  — Admin or Trainer
        [HttpPost]
        public ActionResult Add(ExerciseRequestModel req)
            => Json(_exercise.Add(req));

        // POST /exercise/edit  — Admin or Trainer
        [HttpPost]
        public ActionResult Edit(ExerciseRequestModel req)
            => Json(_exercise.Edit(req));

        // POST /exercise/delete?id=1&adminId=1  — Admin only
        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_exercise.Delete(id, adminId));
        }
    }
}