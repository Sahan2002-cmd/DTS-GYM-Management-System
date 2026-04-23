using GymManagement.DataAccess;
using GymManagement.Interfaces;
using System.Web.Mvc;
using Unity;
using Unity.Mvc5;

namespace GymManagement
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
			var container = new UnityContainer();

            // ── Core ──────────────────────────────────────────
            container.RegisterType<IUser, DAUser>();
            container.RegisterType<IMember, DAMember>();
            container.RegisterType<ITrainer, DATrainer>();
            container.RegisterType<ITrainerAssignment, DATrainerAssignment>();

            // ── RFID & Attendance ─────────────────────────────
            container.RegisterType<IRfidTag, DARfidTag>();
            container.RegisterType<IAttendance, DAAttendance>();
            container.RegisterType<ITrainerAttendance, DATrainerAttendance>(); // *** NEW ***

            // ── Plans & Finance ───────────────────────────────
            container.RegisterType<IPlan, DAPlan>();
            container.RegisterType<ISubscription, DASubscription>();
            container.RegisterType<IPayment, DAPayment>();

            // ── Scheduling ────────────────────────────────────
            container.RegisterType<ITimeSlot, DATimeSlot>();
            container.RegisterType<ITrainerTimeSlot, DATrainerTimeSlot>();
            container.RegisterType<ISchedule, DASchedule>();

            // ── Equipment & Exercise ──────────────────────────
            container.RegisterType<IEquipment, DAEquipment>();
            container.RegisterType<IEquipmentAssignment, DAEquipmentAssignment>();
            container.RegisterType<IEquipmentUsageLog, DAEquipmentUsageLog>();
            container.RegisterType<IExercise, DAExercise>();
            container.RegisterType<INonEquipmentExercise, DANonEquipmentExercise>();

            // ── Reports ───────────────────────────────────────
            container.RegisterType<IReport, DAReport>();

            // ── Device ───────────────────────────────────────
            container.RegisterType<IDevice, DADevice>();

            // ── Complain ───────────────────────────────────────
            container.RegisterType<IComplaint, DAComplain>();

            // ── PAR-Q ─────────────────────────────────────────
            container.RegisterType<IParQ, DAParQ>();

            DependencyResolver.SetResolver(new UnityDependencyResolver(container));
        }
    }
}