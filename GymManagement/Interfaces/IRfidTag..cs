using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GymManagement.Interfaces
{
    public interface IRfidTag
    {
        Response GetAll();
        Response GetByMember(int memberId);//new
        Response GetById(int rfidId);
        Response Add(RfidTagRequestModel req);
        Response Edit(RfidTagRequestModel req);
        Response Delete(int rfidId, int adminId);
        Response AssignToMember(int rfidId, int memberId, int adminId);
        Response ToggleStatus(int rfidId, int adminId); // *** NEW ***

    }
}
