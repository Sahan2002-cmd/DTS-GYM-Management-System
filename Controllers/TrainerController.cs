using GymManagement.DataAccess;
using GymManagement.Interfaces;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class TrainerController : Controller
    {
        private readonly ITrainer _trainer;
        private readonly IUser _user;

        public TrainerController(ITrainer trainer, IUser user)
        {
            _trainer = trainer;
            _user = user;
        }

        [HttpGet]
        public ActionResult GetAll()
        {
            return Json(_trainer.GetAllTrainers(), JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetById(int id)
        {
            return Json(_trainer.GetTrainerById(id), JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult GetByUserId(int userId)
        {
            return Json(_trainer.GetTrainerByUserId(userId), JsonRequestBehavior.AllowGet);
        }

        // Admin adds trainer details after approving user as Trainer
        [HttpPost]
        public ActionResult Add(TrainerRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_trainer.AddTrainer(req));
        }

        // Trainer edits own profile (needs admin re-approval — handled by status)
        [HttpPost]
        public ActionResult Edit(TrainerRequestModel req, int adminId)
        {
            return Json(_trainer.EditTrainer(req));
        }

        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_trainer.DeleteTrainer(id, adminId));
        }
        /// <summary>04.20
        /// Returns a list of trainer IDs that have an approved timeslot
        /// covering the current server time (today's day + current hour:minute).
        /// Frontend uses this to show "Available Now" badge.
        /// </summary>
        [HttpGet]
        public ActionResult GetAvailableNow()
        {
            var now = DateTime.Now;
            var dayName = now.DayOfWeek.ToString();   // e.g. "Monday"
            var nowTime = now.TimeOfDay;

            // Fetch all active trainer timeslots via existing DA
            var allSlotsResponse = _trainer.GetAllActiveTimeslots();
            if (allSlotsResponse.StatusCode != 200)
                return Json(new { StatusCode = 200, ResultSet = new List<int>() }, JsonRequestBehavior.AllowGet);

            var slots = allSlotsResponse.ResultSet as IEnumerable<dynamic> ?? new List<dynamic>();

            var availableIds = new List<int>();

            foreach (var slot in slots)
            {
                try
                {
                    // Check day match: selected_days or day_of_week contains today
                    string days = slot.selected_days ?? slot.day_of_week ?? "";
                    bool dayOk = string.IsNullOrWhiteSpace(days)
                                   || days.IndexOf(dayName, StringComparison.OrdinalIgnoreCase) >= 0;
                    if (!dayOk) continue;

                    // Resolve start/end time (custom takes priority over master)
                    string startStr = slot.custom_starttime ?? slot.starttime ?? "";
                    string endStr = slot.custom_endtime ?? slot.endtime ?? "";
                    if (string.IsNullOrWhiteSpace(startStr) || string.IsNullOrWhiteSpace(endStr)) continue;

                    if (!TimeSpan.TryParse(startStr, out var start)) continue;
                    if (!TimeSpan.TryParse(endStr, out var end)) continue;

                    if (nowTime >= start && nowTime <= end)
                    {
                        int tid = slot.trainer_Id ?? slot.trainerId ?? 0;
                        if (tid > 0 && !availableIds.Contains(tid))
                            availableIds.Add(tid);
                    }
                }
                catch { /* skip malformed slot */ }
            }

            return Json(new { StatusCode = 200, ResultSet = availableIds }, JsonRequestBehavior.AllowGet);
        }
    }
}