// https://fakestoreapi.com/docs

import axiosClient from './axiosClient';

const eventApi = {
    getAll: (params) => {
        const url = '/event/geteventsbysemester';
        return axiosClient.get(url);
    },
    getEventBySemester: (month, page, semester) => {
        const url = `/event/geteventsbysemester?month=${month}&pageNo=${page}&pageSize=10&semester=${semester}`;
        return axiosClient.get(url);
    },
    getEventBySemesterAndStudentId: (studentId, month, page, semester) => {
        const url = `/event/geteventsbysemesterandstudentid/${studentId}?month=${month}&pageNo=${page}&pageSize=100&semester=${semester}`;
        return axiosClient.get(url);
    },

    createPreviewEvent: (params) => {
        const url = '/eventschedule/headculture/createpreview/';
        return axiosClient.post(url, null, {
            params: {
                eventName: params.name,
                startDate: params.startDate,
                finishDate: params.finishDate,
                startTime: params.startTime,
                finishTime: params.finishTime,
                // IsContinuous: params.IsContinuous,
            },
        });
    },
    udpateEventPreview: (params) => {
        const url = `/eventschedule/headculture/updatepreview/${params.id}`;
        return axiosClient.post(url, null, {
            params: {
                startDate: params.startDate,
                finishDate: params.finishDate,
                startTime: params.startTime,
                finishTime: params.finishTime,
                // IsContinuous: params.IsContinuous,
            },
        });
    },
    updateEventSchedule: (params, id) => {
        const url = `/eventschedule/headculture/updateschedule/${id}?isOverwritten=true`;
        return axiosClient.post(url, params);
    },
    createEvent: (params, studentId) => {
        const url = `/event/headculture/createevent/${studentId}?isOverwritten=true`;
        return axiosClient.post(url, params);
    },
    createScheduleSession: (params, eventId) => {
        const url = `/eventschedule/headculture/addnewschedule/${eventId}?isOverwritten=true`;
        return axiosClient.post(url, params);
    },
    updateEvent: (params, eventId) => {
        const url = `/event/headculture/updatebeforeevent/${eventId}`;
        return axiosClient.put(url, params);
    },
    getEventScheduleByEvent: (params) => {
        const url = `/eventschedule/geteventschedulebyevent/${params}`;
        return axiosClient.get(url);
    },
    deleteEvent: (params, studentId) => {
        const url = `/event/headculture/deleteevent/${params}/${studentId}`;
        return axiosClient.put(url);
    },

    getAllMemberEvent: (params, index) => {
        const url = `/event/headculture/getmemberjoinevent/${params}?filterIndex=${index}&pageSize=1000&sortBy=id`;
        return axiosClient.get(url);
    },

    getAllMember: (params) => {
        const url = `/event/headculture/getallmemberevent/${params}?pageNo=0&pageSize=1000&sortBy=id`;
        return axiosClient.get(url);
    },
    getAllMemberCancel: (params) => {
        const url = `/event/headculture/getallmembercanceljoinevent/${params}?pageNo=0&pageSize=10&sortBy=id`;
        return axiosClient.get(url);
    },
    updateRoleEvent: (params) => {
        const url = `/event/headculture/updateuserroleevent`;
        return axiosClient.get(url, { params });
    },
    getListMemberToUpdate: (params) => {
        const url = `/event/headculture/getlistmembereventtoupdaterole/${params}`;
        return axiosClient.get(url);
    },
    updateMemberRole: (params) => {
        const url = `/event/headculture/updatelistmembereventrole`;
        return axiosClient.put(url, params);
    },

    getPeriodTime: (id) => {
        const url = `/eventschedule/headculture/getperiodtimeofevent/${id}`;
        return axiosClient.get(url);
    },

    previewUpdateEventSessionTime: (eventId, params) => {
        const url = `/eventschedule/headculture/updatepreview/${eventId}`;
        return axiosClient.post(url, null, {
            params: {
                startDate: params.startDate,
                finishDate: params.finishDate,
                startTime: params.startTime,
                finishTime: params.finishTime,
            },
        });
    },
    // updateEventSchedule: (eventId, params) => {
    //     const url = `/eventschedule/headculture/updateschedule/${eventId}?isOverwritten=true`;
    //     return axiosClient.post(url, params);
    // },

    getMonthsBySemester: (semester) => {
        const url = `/semester/getlistmonths?semester=${semester}`;
        return axiosClient.get(url);
    },

    updateAfterEvent: (params, studentId) => {
        const url = `/event/headculture/updateafterevent/${params.id}/${studentId}`;
        return axiosClient.put(url, null, {
            params: {
                isIncurred: params.isIncurred,
                isUseClubFund: params.isUseClubFund,
                money: params.money,
            },
        });
    },
    getEventById: (eventId) => {
        const url = `/event/geteventbyid/${eventId}`;
        return axiosClient.get(url);
    },

    getAllMemberNotJointEvent: (id) => {
        const url = `/event/headculture/getlistmembernotjoin/${id}?pageNo=0&pageSize=10000`;
        return axiosClient.get(url);
    },
    updateMemberToJoinEvent: (id, body) => {
        const url = `/event/headculture/addlistmemberjoin/${id}`;
        return axiosClient.post(url, body);
    },

    //User
    registerEvent: (eventId, studentId) => {
        const url = `/event/registertojoinevent/${eventId}/${studentId}`;
        return axiosClient.post(url);
    },
    registerEventCommittee: (eventId, studentId, roleEventId) => {
        const url = `/event/registertojoinorganizingcommittee/${eventId}/${studentId}/${roleEventId}`;
        return axiosClient.post(url);
    },
    cancelJointEvent: (eventId, studentId) => {
        const url = `/event/canceltojoinevent/${eventId}/${studentId}`;
        return axiosClient.put(url);
    },

    getAllEventByStudentId: (studentId) => {
        const url = `/event/getalleventbystudentid/${studentId}`;
        return axiosClient.get(url);
    },

    getAllOrganizingCommitteeRoleByEventId: (eventId) => {
        const url = `/event/getallorganizingcommitteerolebyeventid/${eventId}`;
        return axiosClient.get(url);
    },

    getEventByDate: (date) => {
        const url = `/eventschedule/geteventsessionbydate?date=${date}`;
        return axiosClient.get(url);
    },

    getAllSuggestionRole: () => {
        const url = '/event/headculture/getallsuggestionrole';
        return axiosClient.get(url);
    },

    addNewRoleEvent: (newRole) => {
        const url = '/roleevent/addnewroleevent';
        return axiosClient.post(url, newRole);
    },

    getAllRoleEvent: () => {
        const url = '/roleevent/getallroleevent';
        return axiosClient.get(url);
    },

    updateRoleEventName: (roleEventId, newRole) => {
        const url = `/roleevent/updateroleeventname/${roleEventId}`;
        return axiosClient.put(url, newRole);
    },

    updateStatusRoleTournament: (roleTournamentId) => {
        const url = `/tournament/updatestatusroletournament/${roleTournamentId}`;
        return axiosClient.put(url);
    },

    deleteRoleEvent: (roleEventId) => {
        const url = `/roleevent/deleteroleevent/${roleEventId}`;
        return axiosClient.delete(url);
    },

    acceptRequestToJoinEvent: (memberEventId) => {
        const url = `/event/acceptrequesttojoinevent/${memberEventId}`;
        return axiosClient.put(url);
    },

    declineRequestToJoinEvent: (memberEventId) => {
        const url = `/event/declinerequesttojoinevent/${memberEventId}`;
        return axiosClient.put(url);
    },

    getAllRequestToJoinEvent: (eventId) => {
        const url = `/event/getallrequesttojoinevent/${eventId}`;
        return axiosClient.get(url);
    },

    getAllRequestToJoinOrganizingCommittee: (eventId) => {
        const url = `/event/getallrequesttojoinorganizingcommittee/${eventId}`;
        return axiosClient.get(url);
    },
    editRoleEvent: (eventId, params) => {
        const url = `/event/headculture/editroleevent/${eventId}`;
        return axiosClient.put(url, params);
    },

    // getAllOnGoingEvent:{}=>
};
export default eventApi;
