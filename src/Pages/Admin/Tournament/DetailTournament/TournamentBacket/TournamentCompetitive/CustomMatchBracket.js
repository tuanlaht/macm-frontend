import React, { Fragment, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { Button, Dialog, DialogContent, DialogTitle, Paper, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import NumberFormat from 'react-number-format';
import moment from 'moment';

import adminTournament from 'src/api/adminTournamentAPI';
import styles from './CustomMatchBracket.module.scss';
import { Box } from '@mui/system';
import { useSnackbar } from 'notistack';
import UpdateTimeAndArea from './UpdateTimeAndArea';
import UpdateScoreTournament from './UpdateScore';

const cx = classNames.bind(styles);

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function CustomMatchBracket(params) {
    console.log(params.matches, params.rounds);
    let i,
        __matches = [];
    for (i = 1; i <= params.rounds; i++) {
        const round = params.matches.filter((match) => match.round == i);
        __matches.push(round);
    }
    const { enqueueSnackbar } = useSnackbar();
    const [matches, setMatches] = useState(__matches);
    const [dragItem, setDragItem] = useState({});
    const [dragOverItem, setDragOverItem] = useState({});
    const [open, setOpen] = useState(false);
    const [openUpdateTime, setOpenUpdateTime] = useState(false);
    const [match, setMatch] = useState();
    const [isEdit, setEdit] = useState(false);
    const [areaName, setAreaId] = useState();
    const [winner, setWinner] = useState();
    const [value, setValue] = useState(1);
    const [winnerTemp, setWinnerTemp] = useState();

    const handleChangeTab = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        setMatches(__matches);
    }, [params.matches]);

    const onDragStart = (e, match, index, round, isFirst) => {
        // if (params.status !== 0) {
        //     return;
        // }
        if (params.stage > 2) {
            return;
        }
        if ((isFirst == 0 && match.firstPlayer == null) || (isFirst == 1 && match.secondPlayer == null)) {
            return;
        }
        setDragItem({ ...match, index: index, round: round, isFirst: isFirst });
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.childNodes[0]);
        e.dataTransfer.setDragImage(e.target.childNodes[0], 20, 20);
    };

    const onDragOver = (e) => {
        // if (params.status !== 0) {
        //     return;
        // }
        if (params.stage > 2) {
            return;
        }
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        return false;
    };

    const onDragEnd = () => {
        // if (params.status !== 0) {
        //     return;
        // }
        if (params.stage > 2) {
            return;
        }
        setDragItem(null);
        setDragOverItem(null);
    };
    const onDragDrop = (e, match, index, round, isFirst) => {
        // if (params.status !== 0) {
        //     return;
        // }
        if (params.stage > 2) {
            return;
        }
        if ((isFirst == 0 && match.firstPlayer == null) || (isFirst == 1 && match.secondPlayer == null)) {
            return;
        }
        const player = { ...match, index: index, round: round, isFirst: isFirst };
        setDragOverItem(player);
        //if the item is dragged over itself, ignore
        if (JSON.stringify(dragItem) === JSON.stringify(dragOverItem)) {
            return;
        }
        // filter out the currently dragged item
        const indexPlayerDrag = dragItem.isFirst;
        const indexPlayerDrop = player.isFirst;

        if (indexPlayerDrag === indexPlayerDrop) {
            if (indexPlayerDrag === 0) {
                matches[dragItem.round][dragItem.index].firstPlayer = player.firstPlayer;
                matches[player.round][player.index].firstPlayer = dragItem.firstPlayer;
            } else {
                matches[dragItem.round][dragItem.index].secondPlayer = player.secondPlayer;
                matches[player.round][player.index].secondPlayer = dragItem.secondPlayer;
            }
        } else {
            if (indexPlayerDrag === 0) {
                matches[dragItem.round][dragItem.index].firstPlayer = player.secondPlayer;
                matches[player.round][player.index].secondPlayer = dragItem.firstPlayer;
            } else {
                matches[dragItem.round][dragItem.index].secondPlayer = player.firstPlayer;
                matches[player.round][player.index].firstPlayer = dragItem.secondPlayer;
            }
        }
    };

    const updateListMatchesPlayer = async (match) => {
        try {
            const res = await adminTournament.updateListMatchsPlayer(match);
            let variant = 'success';
            enqueueSnackbar(res.message, { variant });
            params.onChangeData && params.onChangeData();
        } catch (error) {
            console.log('Khong the update', error);
        }
    };

    const handleUpdateMatches = () => {
        var merged = [].concat.apply([], __matches);
        updateListMatchesPlayer(merged);
        setEdit(false);
    };

    const handleClickWinner = (e, data) => {
        if (data == null) {
            return;
        }
        setWinnerTemp(data);
        setWinner(data);
    };

    const handleClickResult = (e, data) => {
        if (params.stage < 2) {
            return;
        }
        if (data.firstPlayer == null || data.secondPlayer == null) {
            setMatch(data);
            setValue(0);
        } else {
            if (data.firstPlayer.point == null && data.secondPlayer.point == null) {
                setMatch(data);
            } else {
                return;
            }
        }

        if (!params.matches[params.matches.length - 1].area) {
            return;
        }
        setAreaId(data.area);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setMatch();
        setWinnerTemp();
        setWinner();
        handleCloseUpdateTime();
    };

    const updateTimeAndPlace = async (matchId, match) => {
        try {
            const res = await adminTournament.updateTimeAndPlaceMatch(matchId, match);
            params.onChangeData && params.onChangeData();
            let variant = res.message.includes('trùng') ? 'error' : 'success';
            enqueueSnackbar(res.message, { variant });
        } catch (error) {
            let variant = 'error';
            enqueueSnackbar('khong the cap nhat thoi gian', { variant });
        }
    };

    const handleCloseUpdateTime = () => {
        setOpenUpdateTime(false);
    };

    const handleUpdateTime = (data) => {
        updateTimeAndPlace(match.id, data);
        var merged = [].concat.apply([], __matches);
        params.onUpdateResult(merged);
        handleClose();
    };

    const UpdateScore = ({ value, index }) => {
        return (
            <Box
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
            >
                {match && match.firstPlayer && match.secondPlayer ? (
                    <UpdateScoreTournament
                        match={match}
                        winner={winner}
                        handleClose={handleClose}
                        WinnerTemp={winnerTemp}
                        onChangeData={() => {
                            params.onChangeData && params.onChangeData();
                        }}
                        round={params.rounds}
                        onHaveResult={() => params.onHaveResult && params.onHaveResult()}
                    />
                ) : (
                    <Typography variant="body1">Trận đấu chưa đủ vận động viên để có thể xác nhận điểm số</Typography>
                )}
            </Box>
        );
    };

    const UpdateTime = ({ value, index }) => {
        return (
            <Box
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
            >
                {match && (
                    <UpdateTimeAndArea
                        match={match}
                        areaList={params.areaList}
                        name={areaName}
                        onClose={handleClose}
                        onUpdate={handleUpdateTime}
                        endDate={params.endDate}
                    />
                )}
            </Box>
        );
    };

    return (
        <Fragment>
            <Dialog fullWidth maxWidth="lg" open={open} onClose={handleClose}>
                <div>
                    <DialogTitle>
                        {value == 0 ? 'Thời gian và địa điểm thi đấu' : 'Xác nhận người chiến thắng'}
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs
                                    value={value}
                                    onChange={handleChangeTab}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    aria-label="basic tabs example"
                                >
                                    {!(
                                        match &&
                                        match.firstPlayer &&
                                        match.secondPlayer &&
                                        match.firstPlayer.point !== null &&
                                        match.secondPlayer.point !== null
                                    ) && <Tab label="Thời gian và địa điểm" {...a11yProps(0)} value={0} />}
                                    {/* {match && match.firstPlayer.point !== null && match.secondPlayer.point !== null && ( */}
                                    <Tab
                                        label="Điểm số"
                                        {...a11yProps(1)}
                                        value={1}
                                        disabled={!(match && match.firstPlayer && match.secondPlayer)}
                                    />
                                </Tabs>
                            </Box>
                            <UpdateTime value={value} index={0} />
                            <UpdateScore value={value} index={1} />
                        </Box>
                    </DialogContent>
                    {/* <DialogActions>
                        <Button onClick={handleClose}>Hủy bỏ</Button>
                        {value == 1 ? (
                            <Button onClick={handleSubmit(handleUpdate)}>Đồng ý</Button>
                        ) : (
                            <Button onClick={handleSubmit(handleUpdateTime)}>Đồng ý</Button>
                        )}
                    </DialogActions> */}
                </div>
            </Dialog>
            {params.stage === 3 && <Typography variant="caption">*Chọn vào 1 cặp trận để cập nhật tỉ số</Typography>}
            {params.stage >= 2 && params.matches[params.matches.length - 1].area && (
                <Typography variant="caption">
                    *Chọn vào 1 cặp trận để cập nhật thời gian, địa điểm thi đấu và tỉ số
                </Typography>
            )}
            {params.stage < 2 ? (
                // !params.isCreate ? (
                <Paper sx={{ p: 2 }}>
                    <Typography variant="caption">
                        Bảng đấu này chỉ là tạm thời, và có thể thay đổi được trước khi giải đấu bắt đầu
                    </Typography>
                    {!isEdit ? (
                        <Typography variant="caption" component={Box}>
                            Bấm chỉnh sửa để chỉnh sửa thứ tự thi đấu
                            <Button variant="outlined" onClick={() => setEdit(true)} sx={{ ml: 2 }}>
                                Chỉnh sửa bảng đấu
                            </Button>
                        </Typography>
                    ) : (
                        <Typography variant="caption" component={Box}>
                            Kéo thả thứ tự thi đấu của vận động viên để cập nhật vị trí
                            <Button variant="outlined" onClick={handleUpdateMatches} sx={{ ml: 2 }}>
                                Xác nhận
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    params.onChangeData && params.onChangeData();
                                    setEdit(false);
                                }}
                                sx={{ ml: 2 }}
                            >
                                Hủy
                            </Button>
                        </Typography>
                    )}
                </Paper>
            ) : (
                // ) : (
                //     <Paper sx={{ p: 2 }}>
                //         <Typography variant="caption">
                //             Danh sách thi đấu có sự thay đổi, bấm tạo để có thể cập nhật số lượng tuyển thủ
                //         </Typography>
                //         <Button variant="outlined" onClick={handleCreateMatches}>
                //             Tạo bảng đấu
                //         </Button>
                //     </Paper>
                // )
                ''
            )}
            <Paper sx={{ overflow: 'auto', maxHeight: '80vh', mt: 2 }}>
                <Box className={cx('tournament-bracket', 'tournament-bracket--rounded')} sx={{ mt: 2, mb: 2 }}>
                    {matches.map((matchs, index) => (
                        <div className={cx('tournament-bracket__round')} key={index}>
                            <h3 className={cx('tournament-bracket__round-title')}>
                                Vòng{' '}
                                {index == matches.length - 1
                                    ? 'tranh hạng 3'
                                    : index == matches.length - 2
                                    ? 'chung kết'
                                    : index == matches.length - 3
                                    ? 'bán kết'
                                    : index + 1}
                            </h3>
                            <ul className={cx('tournament-bracket__list')}>
                                {matchs.map((match, i) =>
                                    index === 0 || index === 1 ? (
                                        <li
                                            className={cx(
                                                'tournament-bracket__item',
                                                (match.firstPlayer && match.secondPlayer) || index === 1
                                                    ? ''
                                                    : 'hidden',
                                            )}
                                            key={match.id}
                                        >
                                            <Box
                                                sx={{
                                                    pr: '1em',
                                                    backgroundColor: '#1e81e2',
                                                    width: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    pl: 0,
                                                    zIndex: 2,
                                                }}
                                                onClick={(e) => handleClickResult(e, match)}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{ m: 1, width: '4em', color: 'white' }}
                                                >
                                                    Cặp {match.matchNo}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            color: 'white',
                                                        }}
                                                    >
                                                        <small>{match.area ? 'Địa điểm: ' + match.area : ''}</small>
                                                    </Box>

                                                    <Tooltip
                                                        title={
                                                            params.stage < 2
                                                                ? `${match.firstPlayer?.studentName} - ${match.firstPlayer?.studentId}`
                                                                : match.firstPlayer?.point ||
                                                                  match.firstPlayer?.point === 0
                                                                ? `${match.firstPlayer?.studentName} - ${match.firstPlayer?.studentId}`
                                                                : `Xác nhận ${match.firstPlayer?.studentName} - ${match.firstPlayer?.studentId} là người chiến thắng`
                                                        }
                                                        disableHoverListener={isEdit || match.firstPlayer === null}
                                                    >
                                                        <div
                                                            className={cx(
                                                                'tournament-bracket__match',
                                                                isEdit ? 'draggable' : '',
                                                                (match.firstPlayer?.point ||
                                                                    match.firstPlayer?.point === 0) &&
                                                                    (match.secondPlayer?.point ||
                                                                        match.secondPlayer?.point === 0)
                                                                    ? Number(match.firstPlayer?.point) >
                                                                      Number(match.secondPlayer?.point)
                                                                        ? 'winner'
                                                                        : 'loser'
                                                                    : '',
                                                            )}
                                                            draggable={isEdit}
                                                            onDragOver={(e) => onDragOver(e)}
                                                            onDragStart={(e) =>
                                                                onDragStart(
                                                                    e,
                                                                    { firstPlayer: match.firstPlayer },
                                                                    i,
                                                                    index,
                                                                    0,
                                                                )
                                                            }
                                                            onDragEnd={() => onDragEnd()}
                                                            onDrop={(e) =>
                                                                onDragDrop(
                                                                    e,
                                                                    { firstPlayer: match.firstPlayer },
                                                                    i,
                                                                    index,
                                                                    0,
                                                                )
                                                            }
                                                            onClick={(e) => handleClickWinner(e, match.firstPlayer)}
                                                        >
                                                            <Box sx={{ m: '0.5em' }} className={cx('name')}>
                                                                <small>{match.firstPlayer?.studentName}</small>
                                                            </Box>
                                                            <Box sx={{ m: '0.5em' }} className={cx('score')}>
                                                                <small>{match.firstPlayer?.point}</small>
                                                            </Box>
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={
                                                            params.stage < 2
                                                                ? `${match.secondPlayer?.studentName} - ${match.secondPlayer?.studentId}`
                                                                : match.secondPlayer?.point ||
                                                                  match.secondPlayer?.point === 0
                                                                ? `${match.secondPlayer?.studentName} - ${match.secondPlayer?.studentId}`
                                                                : `Xác nhận ${match.secondPlayer?.studentName} - ${match.secondPlayer?.studentId} là người chiến thắng`
                                                        }
                                                        disableHoverListener={isEdit || match.secondPlayer === null}
                                                    >
                                                        <div
                                                            className={cx(
                                                                'tournament-bracket__match',
                                                                isEdit ? 'draggable' : '',
                                                                (match.firstPlayer?.point ||
                                                                    match.firstPlayer?.point === 0) &&
                                                                    (match.secondPlayer?.point ||
                                                                        match.secondPlayer?.point === 0)
                                                                    ? Number(match.secondPlayer?.point) >
                                                                      Number(match.firstPlayer?.point)
                                                                        ? 'winner'
                                                                        : 'loser'
                                                                    : '',
                                                            )}
                                                            draggable={isEdit}
                                                            onDragOver={(e) => onDragOver(e)}
                                                            onDragStart={(e) =>
                                                                onDragStart(
                                                                    e,
                                                                    { secondPlayer: match.secondPlayer },
                                                                    i,
                                                                    index,
                                                                    1,
                                                                )
                                                            }
                                                            onDragEnd={() => onDragEnd()}
                                                            onDrop={(e) =>
                                                                onDragDrop(
                                                                    e,
                                                                    { secondPlayer: match.secondPlayer },
                                                                    i,
                                                                    index,
                                                                    1,
                                                                )
                                                            }
                                                            onClick={(e) => handleClickWinner(e, match.secondPlayer)}
                                                        >
                                                            <Box sx={{ m: '0.5em' }} className={cx('name')}>
                                                                <small>{match.secondPlayer?.studentName}</small>
                                                            </Box>
                                                            <Box sx={{ m: '0.5em' }} className={cx('score')}>
                                                                <small>{match.secondPlayer?.point}</small>
                                                            </Box>
                                                        </div>
                                                    </Tooltip>

                                                    <Box
                                                        sx={{
                                                            color: 'white',
                                                        }}
                                                    >
                                                        <small>
                                                            {match.time
                                                                ? 'Thời gian: ' +
                                                                  moment(match.time).format('HH:mm - DD/MM')
                                                                : ''}
                                                        </small>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </li>
                                    ) : (
                                        <li className={cx('tournament-bracket__item')} key={match.id}>
                                            <Box
                                                sx={{
                                                    pr: '1em',
                                                    backgroundColor: '#1e81e2',
                                                    width: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    pl: 0,
                                                    zIndex: 2,
                                                }}
                                                onClick={(e) => handleClickResult(e, match)}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{ m: 1, width: '4em', color: 'white' }}
                                                >
                                                    Cặp {match.matchNo}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            color: 'white',
                                                        }}
                                                    >
                                                        <small>{match.area ? 'Địa điểm: ' + match.area : ''}</small>
                                                    </Box>
                                                    <Tooltip
                                                        title={
                                                            params.stage < 2
                                                                ? `${match.firstPlayer?.studentName} - ${match.firstPlayer?.studentId}`
                                                                : match.firstPlayer?.point
                                                                ? `${match.firstPlayer?.studentName} - ${match.firstPlayer?.studentId}`
                                                                : `Xác nhận ${match.firstPlayer?.studentName} - ${match.firstPlayer?.studentId} là người chiến thắng`
                                                        }
                                                        disableHoverListener={match.firstPlayer === null}
                                                    >
                                                        <div
                                                            className={cx(
                                                                'tournament-bracket__match',
                                                                (match.firstPlayer?.point ||
                                                                    match.firstPlayer?.point === 0) &&
                                                                    (match.secondPlayer?.point ||
                                                                        match.secondPlayer?.point === 0)
                                                                    ? Number(match.firstPlayer?.point) >
                                                                      Number(match.secondPlayer?.point)
                                                                        ? 'winner'
                                                                        : 'loser'
                                                                    : '',
                                                            )}
                                                            onClick={(e) => handleClickWinner(e, match.firstPlayer)}
                                                        >
                                                            <Box sx={{ m: '0.5em' }} className={cx('name')}>
                                                                <small>{match.firstPlayer?.studentName}</small>
                                                            </Box>
                                                            <Box sx={{ m: '0.5em' }} className={cx('score')}>
                                                                <small>{match.firstPlayer?.point}</small>
                                                            </Box>
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={
                                                            params.stage < 2
                                                                ? `${match.secondPlayer?.studentName} - ${match.secondPlayer?.studentId}`
                                                                : match.secondPlayer?.point ||
                                                                  match.secondPlayer?.point === 0
                                                                ? `${match.secondPlayer?.studentName} - ${match.secondPlayer?.studentId}`
                                                                : `Xác nhận ${match.secondPlayer?.studentName} - ${match.secondPlayer?.studentId} là người chiến thắng`
                                                        }
                                                        disableHoverListener={match.secondPlayer === null}
                                                    >
                                                        <div
                                                            className={cx(
                                                                'tournament-bracket__match',
                                                                (match.firstPlayer?.point ||
                                                                    match.firstPlayer?.point === 0) &&
                                                                    (match.secondPlayer?.point ||
                                                                        match.secondPlayer?.point === 0)
                                                                    ? Number(match.secondPlayer?.point) >
                                                                      Number(match.firstPlayer?.point)
                                                                        ? 'winner'
                                                                        : 'loser'
                                                                    : '',
                                                            )}
                                                            onClick={(e) => handleClickWinner(e, match.secondPlayer)}
                                                        >
                                                            <Box sx={{ m: '0.5em' }} className={cx('name')}>
                                                                <small>{match.secondPlayer?.studentName}</small>
                                                            </Box>
                                                            <Box sx={{ m: '0.5em' }} className={cx('score')}>
                                                                <small>{match.secondPlayer?.point}</small>
                                                            </Box>
                                                        </div>
                                                    </Tooltip>
                                                    <Box
                                                        sx={{
                                                            color: 'white',
                                                        }}
                                                    >
                                                        <small>
                                                            {match.time
                                                                ? 'Thời gian: ' +
                                                                  moment(match.time).format('HH:mm - DD/MM')
                                                                : ''}
                                                        </small>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    ))}
                </Box>
            </Paper>
        </Fragment>
    );
}

export default CustomMatchBracket;
