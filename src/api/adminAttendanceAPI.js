import axios from 'axios';
import axiosClient from './axiosClient';

const adminAttendanceAPI = {
    checkAttendanceByScheduleId: (trainingScheduleId, status) => {
        const url = `/admin/headtechnique/checkattendance/${trainingScheduleId}?status=${status}`;
        return axiosClient.get(url);
    },

    takeAttendance: (studentId, trainingScheduleId, status) => {
        const url = `/admin/headtechnique/takeattendance/${studentId}/${trainingScheduleId}?adminStudentId=${
            JSON.parse(localStorage.getItem('currentUser')).studentId
        }`;
        return axiosClient.put(url, null, { params: { status } });
    },

    getTrainingSessionByDate: (date) => {
        const url = `trainingschedule/gettrainingsesionbydate`;
        return axiosClient.get(url, { params: { date } });
    },

    attendanceReportBySemester: (semester) => {
        const url = `/admin/headtechnique/checkattendance/report`;
        return axiosClient.get(url, { params: { semester } });
    },
    getListOldTrainingScheduleToTakeAttendanceBySemester: (semester) => {
        const url = `/admin/headtechnique/getlistoldtrainingscheduletotakeattendancebysemester/${semester}`;
        return axiosClient.get(url);
    },

    //Event

    getAttendanceByEventId: (eventId, status) => {
        const url = `/event/headculture/checkattendance/${eventId}?status=${status}`;
        return axiosClient.get(url);
    },

    takeAttendanceEvent: (eventId, studentId, status) => {
        const url = `/event/headculture/takeattendanceevent/${eventId}/${studentId}?adminStudentId=${
            JSON.parse(localStorage.getItem('currentUser')).studentId
        }`;
        return axiosClient.put(url, null, { params: { status: status } });
    },

    getEventSessionByDate: (date) => {
        const url = '/eventschedule/geteventsessionbydate';
        return axiosClient.get(url, { params: { date: date } });
    },

    getListOldEventToTakeAttendanceBySemester: (semester) => {
        const url = `/event/headculture/getlistoldeventtotakeattendancebysemester/${semester}`;
        return axiosClient.get(url);
    },

    //common
    getCommonSessionByDate: (date) => {
        const url = '/commonschedule/getcommonsessionbydate';
        return axiosClient.get(url, { params: { date } });
    },
    getAttendanceTrainingStatistic: (semesterName, roleId) => {
        const url = `/admin/headtechnique/getattendancetrainingstatistic/${semesterName}?roleId=${roleId}`;
        return axiosClient.get(url);
    },
};

export default adminAttendanceAPI;
