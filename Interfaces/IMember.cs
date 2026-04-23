using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GymManagement.Interfaces
{
    public interface IMember
    {
        Response GetAllMembers();
        Response GetMemberById(int memberId);
        Response GetMemberByUserId(int userId);
        Response AddMember(MemberRequestModel req);
        Response EditMember(MemberRequestModel req);
        Response DeleteMember(int memberId, int adminId);
    }
}
