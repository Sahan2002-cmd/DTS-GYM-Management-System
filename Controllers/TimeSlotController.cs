using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class TimeSlotController : Controller
    {
        private readonly ITimeSlot _timeSlot;
        private readonly IUser _user;

        public TimeSlotController(ITimeSlot timeSlot, IUser user)
        {
            _timeSlot = timeSlot;
            _user = user;
        }

        // GET /timeslot/getall
        [HttpGet]
        public ActionResult GetAll()
            => Json(_timeSlot.GetAll(), JsonRequestBehavior.AllowGet);

        // GET /timeslot/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
            => Json(_timeSlot.GetById(id), JsonRequestBehavior.AllowGet);

        // POST /timeslot/add  — Admin only
        //[HttpPost]
        //public ActionResult Add(TimeSlotRequestModel req, int adminId)
        //{
        //    if (!_user.IsAdmin(adminId))
        //        return Json(new { StatusCode = 403, Message = "Unauthorized" });
        //    return Json(_timeSlot.Add(req));
        //}
        [HttpPost]
        public ActionResult Add(string p_starttime, string p_endtime, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });

            var req = new TimeSlotRequestModel
            {
                p_starttime = p_starttime,
                p_endtime = p_endtime,
                p_admin_id = adminId
            };
            return Json(_timeSlot.Add(req));
        }

        // POST /timeslot/edit  — Admin only
        [HttpPost]
        public ActionResult Edit(TimeSlotRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_timeSlot.Edit(req));
        }

        // POST /timeslot/delete?id=1&adminId=1  — Admin only
        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_timeSlot.Delete(id, adminId));
        }
    }
}