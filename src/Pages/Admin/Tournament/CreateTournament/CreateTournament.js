import {
    Alert,
    Box,
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Fab,
    FormControlLabel,
    Grid,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Snackbar,
    Step,
    StepLabel,
    Stepper,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { Fragment, useEffect, useState } from 'react';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { styled } from '@mui/material/styles';
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import NumberFormat from 'react-number-format';
import facilityApi from 'src/api/facilityApi';
import { DatePicker, DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import moment from 'moment';
import { useSnackbar } from 'notistack';
import { Add, Delete } from '@mui/icons-material';
import { useRef } from 'react';

import eventApi from 'src/api/eventApi';
import PreviewSchedule from './PreviewSchedule';
import adminTournament from 'src/api/adminTournamentAPI';
import FightingCompetition from './FightingCompetition';
import PerformanceCompetition from './PerformanceCompetition';
import { useNavigate } from 'react-router-dom';

const steps = ['Thông tin sự kiện', 'Thêm vai trò BTC', 'Nội dung thi đấu', 'Thêm chi phí', 'Thêm lịch', 'Xem trước'];
const eventRoles = [{ id: 1, name: 'hehe' }];

function CreateTournament({ title, children, isOpen, handleClose, onSucess }) {
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const [activeStep, setActiveStep] = useState(0);
    const [description, setDescription] = useState('');
    const [skipped, setSkipped] = useState(new Set());
    const [isChecked, setIsChecked] = useState(false);
    const [datas, setDatas] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [previewSchedule, setPreviewSchedule] = useState([]);
    const [previewTournament, setPreviewTournament] = useState([]);
    const [isOverride, setIsOverride] = useState(-1);
    const [disabled, setDisabled] = useState(false);
    const [checked, setChecked] = useState(false);
    const [datasFightingCompetition, setDataFightingCompetition] = useState([]);
    const [datasPerformanceCompetition, setDataPerformanceCompetition] = useState([]);
    const navigator = useNavigate();

    const AddFightingCompetitionHandler = (FightingCompetition) => {
        setDataFightingCompetition(FightingCompetition);
    };
    const PerformanceCompetitionHandler = (PerformanceCompetition) => {
        setDataPerformanceCompetition(PerformanceCompetition);
    };

    const handleChangeOverride = (event) => {
        setChecked(event.target.checked);
        if (event.target.checked) {
            setIsOverride(3);
            setDisabled(false);
        } else {
            setDisabled(true);
            setIsOverride(2);
        }
    };

    const isStepOptional = (step) => {
        return step === 2 || step === 1;
    };

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
        setDisabled(false);
        setChecked(false);
    };
    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };
    const validationSchema = Yup.object().shape({
        ...(activeStep === 0
            ? {
                  name: Yup.string().required('Không được để trống trường này'),
              }
            : activeStep === 1
            ? {
                  ...(isChecked
                      ? {
                            roleName: Yup.string()
                                .nullable()
                                .required('Không được để trống trường này')
                                .test('len', 'Không hợp lệ', (val) => val.length > 1)
                                .matches(
                                    /^[a-zA-Z_ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵỷỹ ]+$/,
                                    'Không hợp lệ: vui lòng nhập chữ',
                                ),
                            maxQuantity: Yup.number()
                                .nullable()
                                .required('Không được để trống trường này')
                                .min(1, 'Vui lòng nhập giá trị lớn hơn 0')
                                .max(1000, 'Số lượng không hợp lệ')
                                .typeError('Không được để trống trường này'),
                        }
                      : null),
              }
            : activeStep === 3
            ? {
                  cost: Yup.string().required('Không được để trống trường này'),
                  numOfOrganizingCommitee: Yup.number()
                      .required('Không được để trống trường này')
                      .typeError('Vui lòng nhập số')
                      .min(0, 'Vui lòng nhập giá trị lớn hơn 0'),
                  numOfParticipants: Yup.number()
                      .required('Không được để trống trường này')
                      .typeError('Vui lòng nhập số')
                      .min(0, 'Vui lòng nhập giá trị lớn hơn 0'),

                  feePlayerPay: Yup.number().required('Không được để trống trường này').typeError('Vui lòng nhập số'),
                  feeOrganizingCommiteePay: Yup.number()
                      .required('Không được để trống trường này')
                      .typeError('Vui lòng nhập số'),
              }
            : activeStep === 4
            ? {
                  startDate: Yup.date()
                      //   .max(Yup.ref('finishDate'), ({ min }) => `Thời gian bắt không được bé hơn thời gian kết thúc`)
                      .typeError('Vui lòng không để trống trường này')
                      .required('Vui lòng không để trống trường này'),

                  //   finishDate: Yup.date()
                  //       .min(Yup.ref('startDate'), ({ min }) => `Thời gian kết thúc không được sớm hơn thời gian bắt đầu`)
                  //       .typeError('Vui lòng không để trống trường này')
                  //       .required('Vui lòng không để trống trường này'),
                  finishDate: Yup.date()
                      .test(
                          'same_dates_test',
                          'Thời gian bắt đầu và thời gian kết thúc không được bằng nhau',
                          function (value) {
                              const { startDate } = this.parent;
                              return value.getDate() !== startDate.getDate();
                          },
                      )
                      .min(Yup.ref('startDate'), ({ min }) => `Thời gian kết thúc không được sớm hơn thời gian bắt đầu`)
                      .required('Vui lòng không để trống trường này')
                      .typeError('Vui lòng không để trống trường này')
                      .required('Vui lòng không để trống trường này'),

                  datePlayerDeadline: Yup.date()
                      .max(Yup.ref('startDate'), ({ max }) => `Deadline không được muộn hơn thời gian bắt đầu`)
                      .typeError('Vui lòng không để trống trường này')
                      .required('Vui lòng không để trống trường này'),
                  ...(!skipped.has(1)
                      ? {
                            dateCommitteeDeadline: Yup.date()
                                .max(
                                    Yup.ref('startDate'),
                                    ({ min }) => `Deadline đăng ký BTC phải sớm hơn thời gian bắt đầu`,
                                )
                                .typeError('Vui lòng không để trống trường này')
                                .required('Vui lòng không để trống trường này')
                                .test(
                                    'same_dates_test',
                                    'Deadline đăng ký BTC phải sớm hơn thời gian bắt đầu',
                                    function (value) {
                                        const { startDate } = this.parent;
                                        return value.getDate() !== startDate.getDate();
                                    },
                                ),
                        }
                      : null),
                  //   startDate: Yup.date().typeError('Vui lòng không để trống trường này'),
                  //   finishDate: Yup.date()
                  //       .min(Yup.ref('startDate'), ({ min }) => `Ngày kết thúc không được bé hơn ngày bắt đầu`)
                  //       .typeError('Vui lòng không để trống trường này'),
                  //   dateCommitteeDeadline: Yup.date()
                  //       .max(Yup.ref('startDate'), ({ min }) => `Hạn đăng kí không được để sau ngày bắt đầu`)
                  //       .typeError('Vui lòng không để trống trường này'),
                  //   datePlayerDeadline: Yup.date()
                  //       .max(Yup.ref('startDate'), ({ min }) => `Hạn đăng kí không được để sau ngày bắt đầu`)
                  //       .typeError('Vui lòng không để trống trường này'),
              }
            : null),
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        resetField,
        setFocus,
        setError,
        clearErrors,
        formState: { errors, isDirty, isValid },
    } = useForm({
        resolver: yupResolver(validationSchema),

        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const handleDelete = (id) => {
        // datas.map((data) => {
        //     return data.id === id;
        // });
        setDatas((prevRows) => prevRows.filter((item) => item.id !== id));
    };
    const handleAddEventRoles = (data) => {
        console.log(data);
        const newData = [...datas, { id: Math.random(), roleName: data.roleName, maxQuantity: data.maxQuantity }];
        setDatas(newData);

        /**
         * Reset field keep error (isValid)
         */
        resetField('roleName', { keepError: true });
        resetField('maxQuantity', { keepError: true });

        setIsChecked(!isChecked);
    };
    const handleCancel = () => {
        setIsChecked(!isChecked);

        resetField('roleName', { keepError: true });
        resetField('maxQuantity', { keepError: true });
    };

    console.log('isValid', isValid);
    const formRef = useRef(null);

    const checkOverride = (TournamentSchedule) => {
        const arrayCheck = TournamentSchedule.map((item) => {
            if (item.title.toString() === 'Trùng với Lịch tập') {
                return 2;
            } else if (item.title.toString().includes('Trùng với')) {
                return 1;
            } else {
                return -1;
            }
        });
        console.log('arrayCheck', arrayCheck);
        if (arrayCheck.find((item) => item === 1)) {
            console.log('check', 1);
            setDisabled(true);
            setIsOverride(1);
        } else {
            if (arrayCheck.find((item) => item === 2)) {
                console.log('check', 2);
                setDisabled(true);
                setIsOverride(2);
            } else {
                console.log('check', -1);
                setDisabled(false);
                setIsOverride(-1);
            }
        }
    };

    /**
     * Preview Event
     */
    const handlePreviewSchedule = (data) => {
        setPreviewTournament(data);
        console.log(data);
        let formatData = {
            tournamentName: data.name,
            finishTime: moment(new Date(new Date(2022, 5, 21, 20, 0, 0))).format('HH:mm:ss'),
            startTime: moment(new Date(new Date(2022, 5, 20, 8, 0, 0))).format('HH:mm:ss'),
            startDate: moment(new Date(data.startDate)).format('DD/MM/yyyy'),
            finishDate: moment(new Date(data.finishDate)).format('DD/MM/yyyy'),
        };
        // eventApi.createPreviewTournament(formatData).then((response) => {
        //     console.log('fetch preview schedule data', response);
        //     setPreviewSchedule(response.data);
        // });
        console.log('format Data', formatData);
        handleNext();
        adminTournament.createPreviewTournamentSchedule(formatData).then((res) => {
            console.log('1', res);
            console.log('2', res.data);
            if (res.data.length != 0) {
                console.log(res.data);
                setPreviewSchedule(res.data);
                // setPreviewTournament(res.data);
                checkOverride(res.data);
            } else {
                console.log('huhu');
            }
        });
    };
    /**
     * Create Tournament
     */
    const handleCreateTournament = (data) => {
        const temp =
            data.cost -
            (data.numOfOrganizingCommitee * data.feeOrganizingCommiteePay + data.numOfParticipants * data.feePlayerPay);
        const createTournamentData = {
            tournament: {
                name: data.name,
                description: data.description,
                competitiveTypes: datasFightingCompetition,
                exhibitionTypes: datasPerformanceCompetition,
                maxQuantityComitee: data.numOfOrganizingCommitee,
                feeOrganizingCommiteePay: data.feeOrganizingCommiteePay,
                registrationPlayerDeadline: moment(data.datePlayerDeadline).format('yyyy-MM-DDTHH:mm:ss'),
                registrationOrganizingCommitteeDeadline: moment(
                    data.dateCommitteeDeadline == null ? data.startDate : data.dateCommitteeDeadline,
                ).format('yyyy-MM-DDTHH:mm:ss'),
                feePlayerPay: data.feePlayerPay,
                totalAmountEstimate: data.cost,

                totalAmountFromClubEstimate: temp > 0 ? temp : 0,
            },
            rolesEventDto: datas,
            listPreview: previewSchedule,
        };
        adminTournament.createTournament(createTournamentData).then((response) => {
            enqueueSnackbar(response.message, {
                variant: response.message.includes('Tạo giải đấu thành công') ? 'success' : 'error',
            });
            navigator(`/admin/tournament/${response.data[0].id}`);
            console.log(response);
        });
        console.log(data);
        console.log(createTournamentData);
    };

    const eventSchedule = previewSchedule.map((item, index) => {
        const container = {};
        container['id'] = index;
        container['date'] = item.date;
        container['title'] = item.title;
        container['time'] = item.startTime.slice(0, 5) + ' - ' + item.finishTime.slice(0, 5);
        container['description'] = item.title + ' ' + item.startTime.slice(0, 5) + ' - ' + item.finishTime.slice(0, 5);
        container['display'] = 'background';
        // container['backgroundColor'] = isOverride === -1 || isOverride === 0 ? '#5ba8f5' : '#ff3d00';
        container['backgroundColor'] = item.existed ? '#ffb199' : '#ccffe6';

        return container;
    });
    /**
     * Revalidate form after step changed
     */
    useEffect(() => {
        control._updateValid();
    }, [activeStep, control]);

    useEffect(() => {
        console.log('skip', skipped);
    }, [activeStep, skipped]);

    useEffect(() => {
        if (activeStep === 3) {
            clearErrors('registrationOrganizingCommitteeDeadline');
        }
    }, [activeStep]);

    return (
        <Fragment>
            <Dialog
                fullWidth
                maxWidth="md"
                open={!!isOpen}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <Box
                        component="form"
                        noValidate
                        autoComplete="off"
                        sx={{
                            '& .MuiTextField-root': { mb: 2 },
                        }}
                        ref={formRef}
                    >
                        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                            {steps.map((label, index) => {
                                const stepProps = {};
                                const labelProps = {};
                                if (isStepOptional(index)) {
                                    labelProps.optional = <Typography variant="caption">Tùy chọn</Typography>;
                                }
                                if (isStepSkipped(index)) {
                                    stepProps.completed = false;
                                }
                                return (
                                    <Step key={label} {...stepProps}>
                                        <StepLabel {...labelProps}>{label}</StepLabel>
                                    </Step>
                                );
                            })}
                        </Stepper>
                        {activeStep === steps.length - 1 ? (
                            <Fragment>
                                <Grid container sx={{ mb: 3 }}>
                                    <Grid item xs={6}>
                                        <Box>
                                            <Box>
                                                <Typography
                                                    component="span"
                                                    sx={{ fontSize: '16px', fontWeight: '700' }}
                                                >
                                                    Tên giải đấu:{' '}
                                                </Typography>
                                                <span>{previewTournament.name}</span>
                                            </Box>
                                            <Box>
                                                <Typography
                                                    component="span"
                                                    sx={{ fontSize: '16px', fontWeight: '700' }}
                                                >
                                                    Nội dung:{' '}
                                                </Typography>
                                                <span>{previewTournament.description}</span>
                                            </Box>
                                            <Box>
                                                <Typography
                                                    component="span"
                                                    sx={{ fontSize: '16px', fontWeight: '700' }}
                                                >
                                                    Vai trò trong sự kiện:{' '}
                                                </Typography>
                                                {skipped.has(1) ? (
                                                    <span>Không có</span>
                                                ) : (
                                                    <>
                                                        <br />
                                                        <ul>
                                                            {datas.map((role) => {
                                                                return (
                                                                    <li key={role.id}>
                                                                        {role.roleName} - {role.maxQuantity} người
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Box>
                                            {!skipped.has(2) ? (
                                                <>
                                                    <Box>
                                                        <Typography
                                                            component="span"
                                                            sx={{ fontSize: '16px', fontWeight: '700' }}
                                                        >
                                                            Tổng chi phí dự kiến:{' '}
                                                        </Typography>
                                                        <span>{previewTournament.cost.toLocaleString()} VND</span>
                                                    </Box>
                                                    {/* <Box>
                                                        <Typography
                                                            component="span"
                                                            sx={{ fontSize: '16px', fontWeight: '700' }}
                                                        >
                                                            Số tiền tài trợ từ CLB:{' '}
                                                        </Typography>
                                                        <span>{previewTournament.cost.toLocaleString()} VND</span>
                                                    </Box> */}
                                                    <Box>
                                                        <Typography
                                                            component="span"
                                                            sx={{ fontSize: '16px', fontWeight: '700' }}
                                                        >
                                                            Yêu cầu người chơi đóng tiền:{' '}
                                                        </Typography>
                                                        {skipped.has(2) ? (
                                                            <span>Không</span>
                                                        ) : (
                                                            <>
                                                                {previewTournament.feePlayerPay.toLocaleString()} VND
                                                                (dự kiến)
                                                            </>
                                                        )}
                                                    </Box>
                                                    <Box>
                                                        <Typography
                                                            component="span"
                                                            sx={{ fontSize: '16px', fontWeight: '700' }}
                                                        >
                                                            Yêu cầu ban tổ chức đóng tiền:{' '}
                                                        </Typography>
                                                        {skipped.has(2) ? (
                                                            <span>Không</span>
                                                        ) : (
                                                            <>
                                                                {previewTournament.feeOrganizingCommiteePay.toLocaleString()}{' '}
                                                                VND (dự kiến)
                                                            </>
                                                        )}
                                                    </Box>
                                                </>
                                            ) : null}
                                            <Box>
                                                <Typography
                                                    component="span"
                                                    sx={{ fontSize: '16px', fontWeight: '700' }}
                                                >
                                                    Thời gian bắt đầu:{' '}
                                                </Typography>
                                                <span>
                                                    {moment(new Date(previewTournament.startDate)).format(
                                                        'HH:ss - DD/MM/yyyy',
                                                    )}
                                                </span>
                                            </Box>
                                            <Box>
                                                <Typography
                                                    component="span"
                                                    sx={{ fontSize: '16px', fontWeight: '700' }}
                                                >
                                                    Thời gian kết thúc:{' '}
                                                </Typography>
                                                <span>
                                                    {moment(new Date(previewTournament.finishDate)).format(
                                                        'HH:ss - DD/MM/yyyy',
                                                    )}
                                                </span>
                                            </Box>
                                            <Box>
                                                <Typography
                                                    component="span"
                                                    sx={{ fontSize: '16px', fontWeight: '700' }}
                                                >
                                                    Deadline đăng ký tham gia:{' '}
                                                </Typography>

                                                <span>
                                                    {moment(new Date(previewTournament.datePlayerDeadline)).format(
                                                        'HH:ss - DD/MM/yyyy',
                                                    )}
                                                </span>
                                            </Box>
                                            <Box>
                                                {skipped.has(1) ? null : (
                                                    <>
                                                        <Typography
                                                            component="span"
                                                            sx={{ fontSize: '16px', fontWeight: '700' }}
                                                        >
                                                            Deadline đăng ký ban tổ chức:{' '}
                                                        </Typography>
                                                        <span>
                                                            {moment(
                                                                new Date(previewTournament.dateCommitteeDeadline),
                                                            ).format('HH:ss - DD/MM/yyyy')}
                                                        </span>
                                                    </>
                                                )}
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Box sx={{ height: '50vh', ml: 0 }}>
                                    {(isOverride === 3 || isOverride === 2) && (
                                        <FormControlLabel
                                            sx={{ marginLeft: '1px' }}
                                            control={
                                                <Switch
                                                    hidden={isOverride === 1}
                                                    checked={checked}
                                                    onChange={handleChangeOverride}
                                                />
                                            }
                                            label="Lịch đang trùng với lịch tập, bạn có muốn tạo không"
                                        />
                                    )}
                                    <PreviewSchedule
                                        dataPreview={eventSchedule}
                                        initialDate={eventSchedule[0] && new Date(eventSchedule[0].date)}
                                    />
                                </Box>
                            </Fragment>
                        ) : // <Fragment>
                        //     <Typography sx={{ mt: 2, mb: 1 }}>Step {activeStep + 1}</Typography>
                        // </Fragment>
                        activeStep === 0 ? (
                            <>
                                <TextField
                                    id="outlined-basic"
                                    label="Tên giải đấu"
                                    variant="outlined"
                                    fullWidth
                                    {...register('name')}
                                    error={errors.name ? true : false}
                                    helperText={errors.name?.message}
                                />
                                <TextField
                                    fullWidth
                                    id="outlined-multiline-static"
                                    label="Nội dung"
                                    multiline
                                    rows={4}
                                    defaultValue=""
                                    {...register('description')}
                                />
                            </>
                        ) : activeStep === 1 ? (
                            <>
                                <Box>
                                    {datas.length > 0 && (
                                        <TableContainer sx={{ maxHeight: 440, m: 1, p: 1 }}>
                                            <Table stickyHeader aria-label="sticky table">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align="center">Tên vai trò</TableCell>
                                                        <TableCell align="center">Số lượng</TableCell>
                                                        <TableCell align="center"></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {datas.map((data) => (
                                                        <TableRow key={data.id}>
                                                            <TableCell align="center">{data.roleName}</TableCell>
                                                            <TableCell align="center">{data.maxQuantity}</TableCell>
                                                            <TableCell>
                                                                <IconButton
                                                                    aria-label="delete"
                                                                    onClick={() => {
                                                                        // handleOpenDialog();
                                                                        handleDelete(data.id);
                                                                    }}
                                                                >
                                                                    <Delete />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                    <Paper elevation={3}>
                                        <Collapse in={isChecked}>
                                            <Grid container spacing={2} sx={{ p: 2 }}>
                                                <Grid item xs={12} container spacing={2}>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            id="outlined-basic"
                                                            label="Tên vai trò"
                                                            variant="outlined"
                                                            fullWidth
                                                            {...register('roleName')}
                                                            error={errors.roleName ? true : false}
                                                            helperText={errors.roleName?.message}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Số lượng"
                                                            type="number"
                                                            id="outlined-basic"
                                                            variant="outlined"
                                                            fullWidth
                                                            {...register('maxQuantity')}
                                                            error={errors.maxQuantity ? true : false}
                                                            helperText={errors.maxQuantity?.message}
                                                        />
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Button
                                                        variant="contained"
                                                        onClick={handleSubmit(handleAddEventRoles)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        Thêm
                                                    </Button>
                                                    <Button variant="contained" color="error" onClick={handleCancel}>
                                                        Hủy
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Collapse>
                                    </Paper>
                                    <Collapse in={!isChecked}>
                                        <Fab
                                            color="primary"
                                            variant="extended"
                                            aria-label="add"
                                            onClick={() => setIsChecked(!isChecked)}
                                            size="medium"
                                        >
                                            <Add />
                                            Thêm vai trò
                                        </Fab>
                                    </Collapse>
                                    {/* <button disabled={!isDirty || !isValid} type="submit">
                                        Submit
                                    </button> */}
                                </Box>
                            </>
                        ) : activeStep === 2 ? (
                            <>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Typography sx={{ marginLeft: '10px', fontWeight: 500, mb: 2 }} variant="body1">
                                            Thi đấu đối kháng
                                        </Typography>
                                        <FightingCompetition
                                            onAddFightingCompetition={AddFightingCompetitionHandler}
                                            data={datasFightingCompetition}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <Typography sx={{ marginLeft: '10px', fontWeight: 500, mb: 2 }} variant="body1">
                                            Thi đấu biểu diễn
                                        </Typography>
                                        <PerformanceCompetition
                                            onAddPerformanceCompetition={PerformanceCompetitionHandler}
                                            data={datasPerformanceCompetition}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        ) : activeStep === 3 ? (
                            <>
                                <Controller
                                    name="cost"
                                    variant="outlined"
                                    defaultValue=""
                                    control={control}
                                    render={({ field: { onChange, value }, fieldState: { error, invalid } }) => (
                                        <NumberFormat
                                            name="cost"
                                            customInput={TextField}
                                            label="Tổng chi phí tổ chức"
                                            thousandSeparator={true}
                                            variant="outlined"
                                            defaultValue=""
                                            value={value}
                                            onValueChange={(v) => {
                                                onChange(Number(v.value));
                                            }}
                                            InputProps={{
                                                endAdornment: <InputAdornment position="end">vnđ</InputAdornment>,
                                            }}
                                            error={invalid}
                                            helperText={invalid ? error.message : null}
                                            fullWidth
                                        />
                                    )}
                                />
                                <Grid container columns={12} spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            type="number"
                                            id="outlined-basic"
                                            label="Số người dự kiến tham gia ban tổ chức"
                                            variant="outlined"
                                            fullWidth
                                            {...register('numOfOrganizingCommitee')}
                                            error={errors.numOfOrganizingCommitee ? true : false}
                                            helperText={errors.numOfOrganizingCommitee?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Controller
                                            name="feeOrganizingCommiteePay"
                                            variant="outlined"
                                            defaultValue=""
                                            control={control}
                                            render={({
                                                field: { onChange, value },
                                                fieldState: { error, invalid },
                                            }) => (
                                                <NumberFormat
                                                    name="feeOrganizingCommiteePay"
                                                    customInput={TextField}
                                                    label="Phí tham gia ban tổ chức"
                                                    thousandSeparator={true}
                                                    onValueChange={(v) => {
                                                        onChange(Number(v.value));
                                                    }}
                                                    variant="outlined"
                                                    defaultValue=""
                                                    value={value}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">vnđ</InputAdornment>
                                                        ),
                                                    }}
                                                    error={invalid}
                                                    helperText={invalid ? error.message : null}
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                                    <Grid item xs={6}>
                                        <TextField
                                            type="number"
                                            id="outlined-basic"
                                            label="Số người dự kiến tham gia thi đấu"
                                            variant="outlined"
                                            fullWidth
                                            {...register('numOfParticipants')}
                                            error={errors.numOfParticipants ? true : false}
                                            helperText={errors.numOfParticipants?.message}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Controller
                                            name="feePlayerPay"
                                            variant="outlined"
                                            defaultValue=""
                                            control={control}
                                            render={({
                                                field: { onChange, value },
                                                fieldState: { error, invalid },
                                            }) => (
                                                <NumberFormat
                                                    name="feePlayerPay"
                                                    customInput={TextField}
                                                    label="Phí tham gia thi đấu"
                                                    thousandSeparator={true}
                                                    onValueChange={(v) => {
                                                        onChange(Number(v.value));
                                                    }}
                                                    variant="outlined"
                                                    defaultValue=""
                                                    value={value}
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">vnđ</InputAdornment>
                                                        ),
                                                    }}
                                                    error={invalid}
                                                    helperText={invalid ? error.message : null}
                                                    fullWidth
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </>
                        ) : activeStep === 4 ? (
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                                <Grid container columns={12} spacing={2}>
                                    <Grid item xs={6}>
                                        <Controller
                                            required
                                            name="startDate"
                                            control={control}
                                            defaultValue={null}
                                            render={({
                                                field: { onChange, value },
                                                fieldState: { error, invalid },
                                            }) => (
                                                <DatePicker
                                                    label="Ngày bắt đầu"
                                                    inputFormat="dd/MM/yyyy"
                                                    disablePast
                                                    ampm={false}
                                                    value={value}
                                                    onChange={(value) => onChange(value)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            sx={{
                                                                marginTop: '0px !important',
                                                                marginBottom: '16px !important',
                                                            }}
                                                            {...params}
                                                            required
                                                            id="outlined-disabled"
                                                            error={invalid}
                                                            helperText={invalid ? error.message : null}
                                                            // id="startDate"
                                                            variant="outlined"
                                                            margin="dense"
                                                            fullWidth
                                                        />
                                                    )}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Controller
                                            required
                                            name="finishDate"
                                            inputFormat="dd/MM/yyyy"
                                            control={control}
                                            defaultValue={null}
                                            render={({
                                                field: { onChange, value },
                                                fieldState: { error, invalid },
                                            }) => (
                                                <DatePicker
                                                    label="Ngày kết thúc"
                                                    minDate={startDate}
                                                    disablePast
                                                    ampm={false}
                                                    inputFormat="dd/MM/yyyy"
                                                    value={value}
                                                    onChange={(value) => onChange(value)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            sx={{
                                                                marginTop: '0px !important',
                                                                marginBottom: '16px !important',
                                                            }}
                                                            {...params}
                                                            required
                                                            id="outlined-disabled"
                                                            error={invalid}
                                                            helperText={invalid ? error.message : null}
                                                            // id="startDate"
                                                            variant="outlined"
                                                            margin="dense"
                                                            fullWidth
                                                        />
                                                    )}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Controller
                                            required
                                            name="datePlayerDeadline"
                                            control={control}
                                            defaultValue={null}
                                            render={({
                                                field: { onChange, value },
                                                fieldState: { error, invalid },
                                            }) => (
                                                <DatePicker
                                                    label="Hạn đăng kí cho người chơi"
                                                    inputFormat="dd/MM/yyyy"
                                                    disablePast
                                                    ampm={false}
                                                    minDate={startDate}
                                                    value={value}
                                                    onChange={(value) => onChange(value)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            sx={{
                                                                marginTop: '0px !important',
                                                                marginBottom: '16px !important',
                                                            }}
                                                            {...params}
                                                            required
                                                            id="outlined-disabled"
                                                            error={invalid}
                                                            helperText={invalid ? error.message : null}
                                                            // id="startDate"
                                                            variant="outlined"
                                                            margin="dense"
                                                            fullWidth
                                                        />
                                                    )}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Controller
                                            required
                                            name="dateCommitteeDeadline"
                                            inputFormat="dd/MM/yyyy"
                                            control={control}
                                            defaultValue={skipped.has(1) ? null : null}
                                            render={({
                                                field: { onChange, value },
                                                fieldState: { error, invalid },
                                            }) => (
                                                <DatePicker
                                                    label="Hạn đăng kí tham gia ban tổ chức"
                                                    minDate={startDate}
                                                    disabled={skipped.has(1)}
                                                    disablePast
                                                    ampm={false}
                                                    inputFormat="dd/MM/yyyy"
                                                    value={value}
                                                    onChange={(value) => onChange(value)}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            sx={{
                                                                marginTop: '0px !important',
                                                                marginBottom: '16px !important',
                                                            }}
                                                            {...params}
                                                            required
                                                            id="outlined-disabled"
                                                            error={invalid}
                                                            helperText={invalid ? error.message : null}
                                                            // id="startDate"
                                                            variant="outlined"
                                                            margin="dense"
                                                            fullWidth
                                                        />
                                                    )}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                            </LocalizationProvider>
                        ) : null}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                        Quay lại
                    </Button>
                    <Box>
                        {isStepOptional(activeStep) && (
                            <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                                Bỏ qua
                            </Button>
                        )}
                        {activeStep === steps.length - 1 ? (
                            <Button onClick={handleSubmit(handleCreateTournament)} disabled={disabled}>
                                Tạo giải đấu
                            </Button>
                        ) : activeStep === 1 ? (
                            <Button onClick={handleNext} disabled={datas.length === 0}>
                                {activeStep === steps.length - 2 ? 'Xem trước' : 'Tiếp tục'}
                            </Button>
                        ) : activeStep === 2 ? (
                            <Button
                                onClick={handleNext}
                                disabled={
                                    datasFightingCompetition.length === 0 && datasPerformanceCompetition.length === 0
                                }
                            >
                                {activeStep === steps.length - 2 ? 'Xem trước' : 'Tiếp tục'}
                            </Button>
                        ) : activeStep === 4 ? (
                            <Button onClick={handleSubmit(handlePreviewSchedule)}>Xem trước</Button>
                        ) : (
                            <Button onClick={handleNext} disabled={!isValid}>
                                Tiếp tục
                            </Button>
                        )}
                    </Box>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default CreateTournament;