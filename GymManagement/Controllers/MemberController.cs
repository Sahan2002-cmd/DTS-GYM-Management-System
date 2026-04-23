using GymManagement.Interfaces;
using GymManagement.BusinessLogic;
using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GymManagement.Controllers
{
    public class MemberController : Controller
    {
        private readonly IMember _member;
        private readonly IUser _user;

        public MemberController(IMember member, IUser user)
        {
            _member = member;
            _user = user;
        }

        // GET /member/getall  (Admin / Trainer)
        [HttpGet]
        public ActionResult GetAll()
        {
            return Json(_member.GetAllMembers(), JsonRequestBehavior.AllowGet);
        }

        // GET /member/getbyid?id=1
        [HttpGet]
        public ActionResult GetById(int id)
        {
            return Json(_member.GetMemberById(id), JsonRequestBehavior.AllowGet);
        }

        // GET /member/getbyuserid?userId=5
        [HttpGet]
        public ActionResult GetByUserId(int userId)
        {
            return Json(_member.GetMemberByUserId(userId), JsonRequestBehavior.AllowGet);
        }

        // POST /member/add  (Admin only — called after approving user as Member)
        [HttpPost]
        public ActionResult Add(MemberRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_member.AddMember(req));
        }

        // POST /member/edit
        [HttpPost]
        public ActionResult Edit(MemberRequestModel req, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_member.EditMember(req));
        }

        // POST /member/delete?id=1&adminId=1
        [HttpPost]
        public ActionResult Delete(int id, int adminId)
        {
            if (!_user.IsAdmin(adminId))
                return Json(new { StatusCode = 403, Message = "Unauthorized" });
            return Json(_member.DeleteMember(id, adminId));
        }
    }
}