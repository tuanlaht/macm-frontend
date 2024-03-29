import {
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    InputAdornment,
    Paper,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import PropTypes from 'prop-types';
import { Box } from '@mui/system';
import { useCallback, useState, Fragment, useEffect } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import adminTournamentAPI from 'src/api/adminTournamentAPI';
import { Controller, useForm } from 'react-hook-form';
import { Edit, EmojiEvents } from '@mui/icons-material';
import NumberFormat from 'react-number-format';

import TournamentOverview from './TournamentOverview';
import TournamentSchedule from './TournamentSchedule';
import AdminTournament from '../AdminTournament';
import MemberTournament from '../MemberTournament';
import TournamentFee from './TournamentFee';
import TournamentBacket from './TournamentBacket';
import Preview from './TournamentSchedule/preview';
import { IfAnyGranted } from 'react-authorization';
import userTournamentAPI from 'src/api/userTournamentAPI';
import moment from 'moment';
import NoValuePage from 'src/Components/NoValuePage';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <section
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ padding: '1rem' }}
        >
            {value === index && children}
        </section>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function DetailTournament() {
    let { tournamentId } = useParams();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const [tournament, setTournament] = useState();
    const [scheduleList, setScheduleList] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [value, setValue] = useState(0);
    const [isRender, setIsRender] = useState(true);
    const [valueTab, SetValueTabs] = useState(0);
    const [type, SetType] = useState(0);
    const [roleInTournament, setRoleInTournament] = useState([]);
    const [message, setMessage] = useState('');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleChangeTab = (newValue, tab, id) => {
        setValue(newValue);
        SetValueTabs(tab);
        SetType(id);
    };
    let navigate = useNavigate();

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // const fetchAdminInTournament = async (params) => {
    //     try {
    //         const response = await adminTournamentAPI.getAllTournamentOrganizingCommittee(params);
    //         console.log(response);
    //     } catch (error) {
    //         console.log('Failed to fetch admin list: ', error);
    //     }
    // };
    const getTournamentById = async (tournamentId) => {
        try {
            const response = await adminTournamentAPI.getTournamentById(tournamentId);
            setTournament(response.data[0]);

            setIsRender(false);
            setMessage(response.message);
        } catch (error) {
            console.log('Lấy dữ liệu thất bại', error);
        }
    };

    const fetchTournamentSchedule = async (params) => {
        try {
            const response = await adminTournamentAPI.getTournamentSchedule(params);
            setScheduleList(response.data);
        } catch (error) {
            console.log('That bai roi huhu ', error);
        }
    };

    const getRoleInTournament = async () => {
        try {
            const response = await userTournamentAPI.getAllOrginizingCommitteeRole(tournamentId);
            setRoleInTournament(response.data);
        } catch (error) {
            console.log('Khong the lay duoc role', error);
        }
    };

    isRender && getRoleInTournament();

    useEffect(() => {
        isRender && getTournamentById(tournamentId);
        isRender && fetchTournamentSchedule(tournamentId);
        window.scrollTo({ behavior: 'smooth', top: '0px' });
    }, [tournamentId, tournament, isRender]);

    const scheduleData = scheduleList.map((item) => {
        const container = {};
        container['id'] = item.id;
        container['date'] = item.date;
        container['title'] =
            item.tournament.name + ' - ' + item.startTime.slice(0, 5) + ' - ' + item.finishTime.slice(0, 5);
        container['display'] = 'background';
        container['backgroundColor'] = '#5ba8f5';
        return container;
    });

    const checkUpdate = () => {
        const nowDate = new Date();
        console.log('hehe');
        if (new Date(scheduleList[0].date) <= nowDate) {
            return true;
        } else {
            return false;
        }
    };

    const checkFinish = () => {
        const nowDate = new Date();
        if (new Date(scheduleList[scheduleList.length - 1].date) <= nowDate) {
            return true;
        } else {
            return false;
        }
    };
    const isFinish = scheduleList.length > 0 && checkFinish();
    const isUpdate = scheduleList.length > 0 && checkUpdate();

    const handleDelete = useCallback(
        (id) => () => {
            handleCloseDialog();
            setTimeout(() => {
                adminTournamentAPI.deleteTournament(id).then((res) => {
                    navigate(-1);
                });
            });
        },
        [],
    );
    const handleUpdateTournament = (data) => {
        setTournament(data);
    };
    useEffect(() => {
        if (user.role.name === 'ROLE_Treasurer') {
            setValue(2);
        }
    }, []);

    if (message === 'Giải đấu này đã hủy' || message === 'Không có giải đấu này') {
        return <NoValuePage message="Giải đấu này không tồn tại hoặc đã bị hủy" />;
    }
    return (
        <IfAnyGranted
            expected={[
                'ROLE_HeadTechnique',
                'ROLE_HeadClub',
                'ROLE_ViceHeadTechnique',
                'ROLE_Treasurer',
                'ROLE_ViceHeadClub',
            ]}
            actual={JSON.parse(localStorage.getItem('currentUser')).role.name}
            unauthorized={<Navigate to="/forbidden" />}
        >
            <Box sx={{ m: 1, p: 1, height: '80vh' }}>
                <Dialog
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">{`Bạn muốn xóa sự kiện này ?`}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            Sự kiện sẽ được xóa khỏi hệ thống !
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Hủy</Button>
                        <Button onClick={handleDelete(tournamentId)} autoFocus>
                            Xác nhận
                        </Button>
                    </DialogActions>
                </Dialog>
                {tournament && scheduleData.length > 0 && (
                    <Fragment>
                        <Paper elevation={3}>
                            <Container maxWidth="lg">
                                <Box sx={{ display: 'flex', pt: 1 }}>
                                    <Box>
                                        <Box
                                            sx={{
                                                backgroundColor: '#F0F0F0',
                                                padding: 0.8,
                                                mr: 2,
                                                borderRadius: '10px',
                                                width: '4em',
                                                height: '4em',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flex: 1,
                                            }}
                                        >
                                            <EmojiEvents fontSize="large" sx={{ color: '#0ACE70' }} />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontSize: 'bold' }}>
                                            {tournament.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontSize: 'bold' }}>
                                            {moment(scheduleData[0].date).format('DD/MM/yyyy')} -{' '}
                                            {moment(scheduleData[scheduleData.length - 1].date).format('DD/MM/yyyy')}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Divider />
                                <Box>
                                    {user.role.name === 'ROLE_Treasurer' ? (
                                        <Tabs
                                            value={value}
                                            onChange={handleChange}
                                            variant="scrollable"
                                            scrollButtons="auto"
                                        >
                                            <Tab label="Chi phí" {...a11yProps(2)} value={2} />
                                            <Tab label="Tổng quan" {...a11yProps(0)} value={0} />
                                            <Tab label="Lịch giải đấu" {...a11yProps(1)} value={1} />
                                        </Tabs>
                                    ) : user.role.name === 'ROLE_HeadClub' ||
                                      user.role.name === 'ROLE_HeadTechnique' ||
                                      user.role.name === 'ROLE_ViceHeadTechnique' ||
                                      user.role.name === 'ROLE_ViceHeadClub' ? (
                                        <Tabs
                                            value={value}
                                            onChange={handleChange}
                                            variant="scrollable"
                                            scrollButtons="auto"
                                        >
                                            <Tab label="Tổng quan" {...a11yProps(0)} value={0} />
                                            <Tab label="Lịch giải đấu" {...a11yProps(1)} value={1} />
                                            <Tab label="Chi phí" {...a11yProps(2)} value={2} />
                                            <Tab label="Danh sách ban tổ chức" {...a11yProps(3)} value={3} />
                                            <Tab label="Danh sách vận động viên" {...a11yProps(4)} value={4} />
                                            <Tab label="Bảng đấu" {...a11yProps(5)} value={5} />
                                        </Tabs>
                                    ) : (
                                        <Tabs
                                            value={value}
                                            onChange={handleChange}
                                            variant="scrollable"
                                            scrollButtons="auto"
                                        >
                                            <Tab label="Tổng quan" {...a11yProps(0)} value={0} />
                                            <Tab label="Lịch giải đấu" {...a11yProps(1)} value={1} />
                                            <Tab label="Chi phí" {...a11yProps(2)} value={2} />
                                            <Tab label="Bảng đấu" {...a11yProps(5)} value={5} />
                                        </Tabs>
                                    )}
                                </Box>
                            </Container>
                        </Paper>
                        <Paper elevation={3} sx={{ mt: 1 }}>
                            <TournamentOverview
                                tournament={tournament}
                                onUpdateTournament={handleUpdateTournament}
                                tournamentStage={tournament.stage}
                                value={value}
                                index={0}
                                roleInTournament={roleInTournament}
                                schedule={scheduleList}
                                startTime={scheduleList[0].date}
                                isUpdate={isUpdate}
                                onChangeTab={handleChangeTab}
                            />
                            <TabPanel value={value} index={1}>
                                {user.role.name === 'ROLE_HeadClub' ||
                                user.role.name === 'ROLE_HeadTechnique' ||
                                user.role.name === 'ROLE_ViceHeadTechnique' ||
                                user.role.name === 'ROLE_ViceHeadClub' ? (
                                    <TournamentSchedule
                                        isUpdate={isUpdate}
                                        tournamentStage={tournament.stage}
                                        isChange={() => setIsRender(true)}
                                    />
                                ) : (
                                    <Preview />
                                )}
                            </TabPanel>
                            <TabPanel value={value} index={2}>
                                <TournamentFee
                                    tournament={tournament}
                                    tournamentStatus={tournament.status}
                                    tournamentStage={tournament.stage}
                                    isFinish={isFinish}
                                />
                            </TabPanel>
                            <TabPanel value={value} index={3}>
                                <AdminTournament isUpdate={isUpdate} user={user} onChange={() => setIsRender(true)} />
                            </TabPanel>
                            <TabPanel value={value} index={4}>
                                <MemberTournament
                                    tournament={tournament}
                                    tournamentStatus={tournament.status}
                                    tournamentStage={tournament.stage}
                                    isUpdate={isUpdate}
                                    user={user}
                                    onChange={() => setIsRender(true)}
                                />
                            </TabPanel>
                            <TabPanel value={value} index={5}>
                                <TournamentBacket
                                    tournament={tournament}
                                    tournamentStatus={tournament.status}
                                    tournamentStage={tournament.stage}
                                    valueTab={valueTab}
                                    type={type}
                                    endDate={
                                        scheduleList.length > 0 && new Date(scheduleList[scheduleList.length - 1].date)
                                    }
                                    changeData={() => setIsRender(true)}
                                />
                            </TabPanel>
                        </Paper>
                    </Fragment>
                )}
            </Box>
        </IfAnyGranted>
    );
}

export default DetailTournament;
