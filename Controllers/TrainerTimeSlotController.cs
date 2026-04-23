using GymManagement.Interfaces;
using GymManagement.Models;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class TrainerTimeSlotController : Controller
    {
        private readonly ITrainerTimeSlot _tts;
        private readonly IUser _user;

        public TrainerTimeSlotController(ITrainerTimeSlot tts, IUser user)
        {
            _tts = tts;
            _user = user;
        }

        [HttpGet]
        public ActionResult GetAll() => Json(_tts.GetAll(), JsonRequestBehavior.AllowGet);

        [HttpGet]
        public ActionResult GetById(int id) => Json(_tts.GetById(id), JsonRequestBehavior.AllowGet);

        [HttpGet]
        public ActionResult GetByTrainer(int trainerId) => Json(_tts.GetByTrainer(trainerId), JsonRequestBehavior.AllowGet);

        [HttpPost]
        public ActionResult Add(
            int p_trainer_id,
            int? p_timeslot_id = null,
            string p_day_of_week = null,
            string p_schedule_type = null,
            string p_start_date = null,
            string p_end_date = null,
            string p_selected_days = null,
            string p_custom_starttime = null,
            string p_custom_endtime = null)
        {
            // 🔥 PREVENT SQL CRASH: Convert "" to null so SQL can save it safely
            p_day_of_week = string.IsNullOrWhiteSpace(p_day_of_week) ? null : p_day_of_week;
            p_schedule_type = string.IsNullOrWhiteSpace(p_schedule_type) ? null : p_schedule_type;
            p_start_date = string.IsNullOrWhiteSpace(p_start_date) ? null : p_start_date;
            p_end_date = string.IsNullOrWhiteSpace(p_end_date) ? null : p_end_date;
            p_selected_days = string.IsNullOrWhiteSpace(p_selected_days) ? null : p_selected_days;
            p_custom_starttime = string.IsNullOrWhiteSpace(p_custom_starttime) ? null : p_custom_starttime;
            p_custom_endtime = string.IsNullOrWhiteSpace(p_custom_endtime) ? null : p_custom_endtime;

            var req = new TrainerTimeSlotRequestModel
            {
                p_trainer_id = p_trainer_id,
                p_timeslot_id = p_timeslot_id,
                p_day_of_week = p_selected_days ?? p_day_of_week,
                p_schedule_type = p_schedule_type,
                p_start_date = p_start_date,
                p_end_date = p_end_date,
                p_selected_days = p_selected_days,
                p_custom_starttime = p_custom_starttime,
                p_custom_endtime = p_custom_endtime,
                p_is_active = 0 // Pending Status
            };
            return Json(_tts.Add(req));
        }

        // 🔥 BYPASS MVC ROUTING BUG: Do NOT use the word "id" here. 
        [HttpPost]
        public ActionResult ApproveOrReject(int p_trainer_timeslot_id, int p_is_active, int p_admin_id)
        {
            if (!_user.IsAdmin(p_admin_id)) return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_tts.ApproveOrReject(p_trainer_timeslot_id, p_is_active, p_admin_id));
        }

        [HttpPost]
        public ActionResult Delete(int p_trainer_timeslot_id, int p_admin_id)
        {
            if (!_user.IsAdmin(p_admin_id)) return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_tts.Delete(p_trainer_timeslot_id, p_admin_id));
        }
    }
}