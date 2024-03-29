import React, { Fragment, useEffect, useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    MenuItem,
    Paper,
    Select,
    Tooltip,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useParams } from 'react-router-dom';

import CustomMatchBracket from './CustomMatchBracket';
import adminTournament from 'src/api/adminTournamentAPI';
import Gold from 'src/Components/Common/Material/Gold';
import Sliver from 'src/Components/Common/Material/Sliver';
import Trophy from 'src/Components/Common/Material/Trophy';
import Brone from 'src/Components/Common/Material/Brone';
import LoadingProgress from 'src/Components/LoadingProgress';

function TournamentCompetitive({
    reload,
    setReload,
    result,
    type,
    endDate,
    tournamentStage,
    onHaveResult,
    isUnorganized,
}) {
    let { tournamentId } = useParams();
    const [tournamentResult, setTournamentResult] = useState();
    const [tournamentStatus, setTournamentStatus] = useState(0);
    const { enqueueSnackbar } = useSnackbar();
    const [competitiveId, setCompetitiveId] = useState(type);
    const [listWeightRange, setListWeightRange] = useState([]);
    const [listPlayer, setListPlayer] = useState();
    const [rounds, setRounds] = useState();
    const [areaList, setAreaList] = useState();
    const [open, setOpen] = useState(false);
    const [isRenderTotal, setIsRenderTotal] = useState(true);
    const [isRender, setIsRender] = useState(true);
    // const [tournamentStatus, setTournamentStatus] = useState(-1);

    // useEffect(() => {
    //     console.log(competitiveId);
    //     if (result && result.length > 0) {
    //         const _result =
    //             type !== 0 || competitiveId !== 0
    //                 ? result.find((subResult) => subResult.data.find((d) => d.competitiveType.id == competitiveId))
    //                       .data[0].listResult
    //                 : null;
    //         console.log(_result);
    //         setTournamentResult(_result);
    //     }
    // }, [type, competitiveId, result]);

    // console.log('ewsult', tournamentResult);
    const handleChangeCompetitiveId = (event) => {
        if (result && result.length > 0) {
            const _result =
                result.find((subResult) =>
                    subResult.data.length > 0
                        ? subResult.data.find((d) => d.competitiveType.id == event.target.value)
                        : null,
                ) != null
                    ? result.find((subResult) =>
                          subResult.data.length > 0
                              ? subResult.data.find((d) => d.competitiveType.id == event.target.value)
                              : null,
                      ).data[0].listResult
                    : null;
            console.log(_result);
            setTournamentResult(_result);
        }

        setCompetitiveId(event.target.value);
        getListPlayerByCompetitiveID(event.target.value);
    };

    const getAllArea = async () => {
        try {
            const response = await adminTournament.getAllArea();
            setAreaList(response.data);
        } catch (error) {
            console.log('Khong the lay danh sach san dau');
        }
    };

    const getListPlayerByCompetitiveID = async (weightRange) => {
        try {
            const response = await adminTournament.listMatchs(weightRange);
            if (response.data.length > 0) {
                setListPlayer(response.data[0].listMatchDto);
                setTournamentStatus(response.data[0].status);
                setRounds(response.totalResult);
                // setIsCreate(response.data[0].changed);
            } else {
                setListPlayer(response.data);
                setTournamentStatus(0);
                setRounds(0);
                // setIsCreate(true);
            }
        } catch (error) {
            console.log('Failed to fetch match: ', error);
        }
    };

    useEffect(() => {
        const getListPlayerByCompetitiveID = async (weightRange) => {
            try {
                const response = await adminTournament.listMatchs(weightRange);
                if (response.data.length > 0) {
                    setListPlayer(response.data[0].listMatchDto);
                    setTournamentStatus(response.data[0].status);
                    setRounds(response.totalResult);
                    // setIsCreate(response.data[0].changed);
                } else {
                    setListPlayer(response.data);
                    setTournamentStatus(0);
                    setRounds(0);
                    // setIsCreate(true);
                }
            } catch (error) {
                console.log('Failed to fetch match: ', error);
            }
        };
        isRender && getListPlayerByCompetitiveID(competitiveId);
        setIsRender(false);
    }, [isRender, listPlayer, competitiveId]);

    useEffect(() => {
        const getListPlayerByCompetitiveID = async (weightRange) => {
            try {
                const response = await adminTournament.listMatchs(weightRange);
                if (response.data.length > 0) {
                    setListPlayer(response.data[0].listMatchDto);
                    setTournamentStatus(response.data[0].status);
                    setRounds(response.totalResult);
                    // setIsCreate(response.data[0].changed);
                } else {
                    setListPlayer(response.data);
                    setTournamentStatus(0);
                    setRounds(0);
                    // setIsCreate(true);
                }
                setReload && setReload();
            } catch (error) {
                console.log('Failed to fetch match: ', error);
            }
        };
        reload && getListPlayerByCompetitiveID(competitiveId);
    }, [reload, competitiveId, setReload, listPlayer]);

    const spawnMatches = async (weightRange) => {
        try {
            const response = await adminTournament.spawnMatchs(weightRange);
            getListPlayerByCompetitiveID(weightRange);
            // setListPlayer(response.data)
            setIsRender(true);
            enqueueSnackbar(response.message, { variant: 'success' });
        } catch (error) {
            console.log('Failed to fetch match: ', error);
        }
    };

    const handleDialogCreate = () => {
        if (competitiveId == 0) {
            let varian = 'error';
            enqueueSnackbar('Vui lòng chọn hạng cân trước khi tạo bảng đấu', { varian });
            return;
        }
        // console.log('haha');
        spawnMatches(competitiveId);
    };

    const spawnTimeAndArea = async () => {
        try {
            const response = await adminTournament.spawnTimeAndArea(tournamentId);
            setIsRender(true);
            getListPlayerByCompetitiveID(competitiveId);
            enqueueSnackbar(response.message, { variant: 'success' });
        } catch (error) {
            console.log('Failed to spawn time: ', error);
        }
    };

    const confirmListMatchsPlayer = async () => {
        try {
            const response = await adminTournament.confirmListMatchsPlayer(competitiveId);
            setIsRender(true);
            enqueueSnackbar(response.message, { variant: 'success' });
        } catch (error) {
            console.log('Failed to confirm match: ', error);
        }
    };

    const handleDialogUpdateTime = () => {
        spawnTimeAndArea();
    };

    const handleDialogConfirmMatch = () => {
        setOpen(true);
    };
    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = () => {
        confirmListMatchsPlayer();
        handleCancel();
    };

    const UpdateResultHandler = (newMatches) => {
        setListPlayer(newMatches);
        setIsRender(true);
        // getListPlayerByCompetitiveID(competitiveId);
    };

    useEffect(() => {
        const getListPlayerByCompetitiveID = async (weightRange) => {
            try {
                const response = await adminTournament.listMatchs(weightRange);
                if (response.data.length > 0) {
                    setListPlayer(response.data[0].listMatchDto);
                    setTournamentStatus(response.data[0].status);
                    setRounds(response.totalResult);
                    // setIsCreate(response.data[0].changed);
                } else {
                    setListPlayer(response.data);
                    setTournamentStatus(0);
                    setRounds(0);
                    // setIsCreate(true);
                }
            } catch (error) {
                console.log('Failed to fetch match: ', error);
            }
        };
        const fetchTournamentById = async (tournamentId) => {
            try {
                const response = await adminTournament.getAllCompetitiveType(tournamentId);
                console.log(response);
                if (response.data.length > 0) {
                    setListWeightRange(response.data[0]);
                    getListPlayerByCompetitiveID(response.data[0][0].id);
                    type == 0 && setCompetitiveId(response.data[0][0].id);
                    const _result =
                        result.find((subResult) =>
                            subResult.data.length > 0
                                ? subResult.data.find((d) => d.competitiveType.id == response.data[0][0].id)
                                : null,
                        ) != null
                            ? result.find((subResult) =>
                                  subResult.data.length > 0
                                      ? subResult.data.find((d) => d.competitiveType.id == response.data[0][0].id)
                                      : null,
                              ).data[0].listResult
                            : null;
                    console.log(_result);
                    setTournamentResult(_result);
                }
                setIsRenderTotal(false);
            } catch (error) {
                console.log('Failed to fetch user list: ', error);
            }
        };
        isRenderTotal && fetchTournamentById(tournamentId);
        getAllArea();
    }, [tournamentId, competitiveId, isRenderTotal, result, type]);

    return (
        <Fragment>
            {!isUnorganized ? (
                <>
                    <Dialog maxWidth="xs" open={open}>
                        <DialogTitle>Xác nhận</DialogTitle>
                        <DialogContent dividers>
                            <DialogContentText>
                                Bạn có chắc chắn muốn sử dụng thứ tự thi đấu này và cập nhật thời gian?
                            </DialogContentText>
                            <Typography variant="caption">
                                Sau khi xác nhận sẽ không thay đổi vị trí thi đấu của các tuyển thủ nữa!
                            </Typography>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outline" autoFocus onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button variant="contained" onClick={handleOk}>
                                Xác nhận
                            </Button>
                        </DialogActions>
                    </Dialog>
                    {/* <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h5" gutterBottom component="div" sx={{ fontWeight: 500, marginBottom: 2 }}>
                    Bảng đấu
                </Typography>
            </Box> */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                        <FormControl size="small">
                            <Typography variant="caption">Hạng cân</Typography>
                            <Select
                                id="demo-simple-select"
                                value={competitiveId}
                                displayEmpty
                                onChange={handleChangeCompetitiveId}
                            >
                                {listWeightRange &&
                                    listWeightRange.map((range) => (
                                        <MenuItem value={range.id} key={range.id}>
                                            {range.gender ? 'Nam: ' : 'Nữ: '} {range.weightMin} - {range.weightMax} Kg
                                        </MenuItem>
                                    ))}
                            </Select>
                        </FormControl>
                        {/* {tournamentStatus == 0 && listPlayer.length > 0 && (
                    <Button variant="outlined" onClick={handleDialogConfirmMatch} sx={{ mr: 2, float: 'right' }}>
                        Xác nhận bảng thi đấu
                    </Button>
                )} */}
                    </Box>

                    {tournamentResult != null && (
                        <Paper elevation={3} sx={{ m: 2, p: 2 }}>
                            <Typography variant="h6">Kết quả bảng đấu</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Tooltip title="Huy chương vàng">
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Gold />

                                        <Typography variant="body1">{tournamentResult[0].name}</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Huy chương bạc">
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Sliver />

                                        <Typography variant="body1">{tournamentResult[1].name}</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Huy chương đồng">
                                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                        <Brone />

                                        <Typography variant="body1">{tournamentResult[2].name}</Typography>
                                    </Box>
                                </Tooltip>
                            </Box>
                        </Paper>
                    )}
                    {listPlayer && areaList ? (
                        listPlayer.length > 0 ? (
                            <CustomMatchBracket
                                matches={listPlayer}
                                competitiveId={competitiveId}
                                rounds={rounds}
                                status={tournamentStatus}
                                stage={tournamentStage}
                                areaList={areaList}
                                onUpdateResult={UpdateResultHandler}
                                // isCreate={isCreate}
                                onCreateMatches={handleDialogCreate}
                                onChangeData={() => {
                                    // console.log('render data bracket');
                                    setIsRender(true);
                                }}
                                endDate={endDate}
                                onHaveResult={() => {
                                    onHaveResult && onHaveResult();
                                }}
                            />
                        ) : (
                            <Box sx={{ display: 'flex' }}>
                                <Typography variant="body1" sx={{ m: 'auto' }}>
                                    Thể thức này chưa có thời gian và địa điểm thi đấu
                                </Typography>
                            </Box>
                        )
                    ) : (
                        <LoadingProgress />
                    )}
                </>
            ) : (
                <Box sx={{ display: 'flex' }}>
                    <Typography variant="body1" sx={{ m: 'auto' }}>
                        Giải đấu không tổ chức thi đấu đối kháng
                    </Typography>
                </Box>
            )}
        </Fragment>
    );
}

export default TournamentCompetitive;
