using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using GymManagement.Models;

namespace GymManagement.Interfaces
{
    public interface ITrainerAssignment
    {
        Response GetAll();
        Response GetById(int assignmentId);
        Response GetByMember(int memberId);
        Response GetByTrainer(int trainerId);
        Response Add(TrainerAssignmentRequestModel req);
        Response UpdateStatus(int assignmentId, string status, int adminId);
        Response Delete(int assignmentId, int adminId);
    }
}