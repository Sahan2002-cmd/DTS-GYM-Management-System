using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GymManagement.Interfaces
{
    public interface IEquipmentAssignment
    {
        Response GetAll();
        Response GetById(int eaId);
        Response GetBySchedule(int scheduleId);
        Response GetByMember(int memberId);
        Response Add(EquipmentAssignmentRequestModel req);
        Response Edit(EquipmentAssignmentRequestModel req);
        Response Delete(int eaId, int adminId);
    }
}
