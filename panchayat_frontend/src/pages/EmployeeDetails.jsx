import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoaderSpinner from '../components/LoaderSpinner';
import Pagination from '../components/Pagination';

const EmployeeDetails = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchEmployees();
    }, [currentPage]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:5000/api/employee?page=${currentPage}&limit=${itemsPerPage}`);
            setEmployees(response.data.employees || response.data);
            setTotalPages(Math.ceil((response.data.total || response.data.length) / itemsPerPage));
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setShowModal(true);
    };

    const getStatusBadge = (status) => {
        const statuses = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-gray-100 text-gray-800',
            suspended: 'bg-yellow-100 text-yellow-800',
            terminated: 'bg-red-100 text-red-800'
        };
        return statuses[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">કર્મચારી વિગત</h1>
                <p className="text-gray-600 mt-1">તમામ કર્મચારીઓની સંપૂર્ણ માહિતી જુઓ</p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="કર્મચારી શોધો (નામ, કોડ, વિભાગ)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Employees Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">કર્મચારી કોડ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">નામ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">વિભાગ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">હોદ્દો</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">મોબાઇલ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">સ્થિતિ</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ક્રિયા</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center">
                                        <LoaderSpinner />
                                    </td>
                                </tr>
                            ) : filteredEmployees.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        કોઈ કર્મચારી નથી
                                    </td>
                                </tr>
                            ) : (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">{emp.employeeCode}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{emp.firstName} {emp.lastName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{emp.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{emp.designation}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{emp.mobileNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(emp.status)}`}>
                                                {emp.status === 'active' ? 'સક્રિય' : 
                                                 emp.status === 'inactive' ? 'નિષ્ક્રિય' :
                                                 emp.status === 'suspended' ? 'સ્થગિત' : 'સમાપ્ત'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => handleViewDetails(emp)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                વિગત જુઓ
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            {/* Employee Details Modal */}
            {showModal && selectedEmployee && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">કર્મચારી વિગત</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-3">વ્યક્તિગત માહિતી</h3>
                                    <p><strong>કર્મચારી કોડ:</strong> {selectedEmployee.employeeCode}</p>
                                    <p><strong>નામ:</strong> {selectedEmployee.firstName} {selectedEmployee.lastName}</p>
                                    <p><strong>પિતાનું નામ:</strong> {selectedEmployee.fatherName}</p>
                                    <p><strong>માતાનું નામ:</strong> {selectedEmployee.motherName || '-'}</p>
                                    <p><strong>જન્મ તારીખ:</strong> {new Date(selectedEmployee.dateOfBirth).toLocaleDateString()}</p>
                                    <p><strong>લિંગ:</strong> {selectedEmployee.gender === 'male' ? 'પુરુષ' : selectedEmployee.gender === 'female' ? 'સ્ત્રી' : 'અન્ય'}</p>
                                    <p><strong>આધાર:</strong> {selectedEmployee.aadharNumber}</p>
                                    <p><strong>પાન:</strong> {selectedEmployee.panNumber || '-'}</p>
                                    <p><strong>મોબાઇલ:</strong> {selectedEmployee.mobileNumber}</p>
                                    <p><strong>ઈમેલ:</strong> {selectedEmployee.email}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-3">નોકરી માહિતી</h3>
                                    <p><strong>જોડાવાની તારીખ:</strong> {new Date(selectedEmployee.joiningDate).toLocaleDateString()}</p>
                                    <p><strong>વિભાગ:</strong> {selectedEmployee.department}</p>
                                    <p><strong>હોદ્દો:</strong> {selectedEmployee.designation}</p>
                                    <p><strong>કર્મચારી પ્રકાર:</strong> {selectedEmployee.employeeType === 'permanent' ? 'કાયમી' : 
                                        selectedEmployee.employeeType === 'contract' ? 'કોન્ટ્રાક્ટ' :
                                        selectedEmployee.employeeType === 'temporary' ? 'કામચલાઉ' : 'પ્રોબેશન'}</p>
                                    <p><strong>સ્થિતિ:</strong> {selectedEmployee.status === 'active' ? 'સક્રિય' : 
                                        selectedEmployee.status === 'inactive' ? 'નિષ્ક્રિય' :
                                        selectedEmployee.status === 'suspended' ? 'સ્થગિત' : 'સમાપ્ત'}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-3">સરનામું</h3>
                                    <p>{selectedEmployee.address?.street || '-'}</p>
                                    <p>{selectedEmployee.address?.city}, {selectedEmployee.address?.district}</p>
                                    <p>{selectedEmployee.address?.state} - {selectedEmployee.address?.pincode}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-gray-800 mb-3">બેંક માહિતી</h3>
                                    <p><strong>બેંક:</strong> {selectedEmployee.bankDetails?.bankName || '-'}</p>
                                    <p><strong>એકાઉન્ટ:</strong> {selectedEmployee.bankDetails?.accountNumber || '-'}</p>
                                    <p><strong>IFSC:</strong> {selectedEmployee.bankDetails?.ifscCode || '-'}</p>
                                    <p><strong>શાખા:</strong> {selectedEmployee.bankDetails?.branchName || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                            >
                                બંધ કરો
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeDetails;
