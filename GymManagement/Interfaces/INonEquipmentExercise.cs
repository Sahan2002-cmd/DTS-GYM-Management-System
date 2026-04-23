using GymManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GymManagement.Interfaces
{
    public interface INonEquipmentExercise
    {
        Response GetAll();
        Response GetById(int useId);
        Response GetBySchedule(int scheduleId);
        Response Add(NonEquipmentExerciseRequestModel req);
        Response Edit(NonEquipmentExerciseRequestModel req);
        Response UpdateStatus(int useId, string status);
        Response Delete(int useId, int adminId);
        // ADD to the interface for Admin Approval
        Response Approve(int useId, string approvalStatus, int adminId);
    }
}
