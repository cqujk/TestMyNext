import React, {useEffect, useState} from 'react';
import BaseTable from '@/components/Table/BaseTable';
import fetchWithAuth from "@/lib/api/fetchWithAuth";
import ChartAndStats from "@/components/Class/ClassChartAndStats";
interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    teachingId: number | string | null; // 假设每行数据都有一个唯一的ID
}

const DetailModal: React.FC<DetailModalProps> = ({isOpen, onClose, teachingId}) => {
    //const [classDetails, setClassDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState<string | null>(null);
    const [showData, setShowData] = useState<any[]>([]);
    useEffect(() => {
        if (isOpen && teachingId) {
            fetchDetailData();
        }
    }, [isOpen, teachingId]);

    const fetchDetailData = async () => {
        try {
            const response = await fetchWithAuth(`/api/teaching-record/teacher-class-info-detail?teachingId=${teachingId}`); // 假设URL为 xxx/{rowId}
            if (!response.ok) {
                console.log('Error:', response.status, response.statusText)
                //throw new Error('Network response was not ok');
            }
            const data = await response.json();
            // setTeachingId(data);
            // 解析 gradeDetail 字段
            console.log('Data:', data);
            const parsedData = data.detailedClassInfo.map((cls:any)=>({
                studentId: cls.studentId,
                totalGrade: cls.totalGrade,
                enrollmentId: cls.enrollmentId,
                studentName: cls.studentName,
                gender: cls.gender === "f"?'女':'男',
                major: cls.major,
                gpa: cls.gpa,
                gradeDetail: JSON.parse(cls.gradeDetail)
            }));
           // console.log('Parsed Data:', parsedData);
            setShowData(parsedData);
        } catch (error) {
            //setError(error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    // 确保 useMemo 始终被调用
    const data = React.useMemo(
        () =>
            showData?.map((cls) =>
                ({
                    studentId: cls.studentId,
                    totalGrade: cls.totalGrade,
                    enrollmentId: cls.enrollmentId,
                    gradeDetail: cls.gradeDetail,
                    studentName: cls.studentName,
                    gender: cls.gender, // 这里已经是转换后的值
                    major: cls.major,
                    gpa: cls.gpa,
                })),
        [showData]
    );

    const columns = React.useMemo(
        () => [
            {
                Header: '学号',
                accessor: 'studentId',
            },
            {
                Header: '学生姓名',
                accessor: 'studentName',
            },
            {
                Header: '性别',
                accessor: 'gender',
            },
            {
                Header: '专业',
                accessor: 'major',
            },
            {
                Header: '总成绩',
                accessor: 'totalGrade',
            },
            {
                Header: '实验成绩',
                accessor: 'gradeDetail.lab_score',
            },
            {
                Header: '期末成绩',
                accessor: 'gradeDetail.final_score',
            },
            {
                Header: '期中成绩',
                accessor: 'gradeDetail.midterm_score',
            },
            {
                Header: '平时成绩',
                accessor: 'gradeDetail.regular_score',
            },

            // {
            //     Header: 'GPA',
            //     accessor: 'gpa',
            // },
        ],
        []
    );
    if (!isOpen) {
        return null;
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-6xl overflow-hidden max-h-screen flex flex-row h-full">
                <div className="w-1/3 pr-2 h-full overflow-y-auto border-r border-gray-300">
                    {showData && showData.length > 0 ? (
                        <ChartAndStats data={showData}/>
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
                <div className="w-2/3 pl-2 h-full overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">详细信息</h2>
                    {loading ? (
                        <div>Loading...</div>
                    ) : showData && showData.length > 0 ? (
                        <>
                            <BaseTable columns={columns} data={showData}/>
                            <button
                                onClick={onClose}
                                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
                            >
                                关闭
                            </button>
                        </>
                    ) : (
                        <div>No data available</div>
                    )}
                </div>
            </div>
        </div>
    );
}


export default DetailModal;
