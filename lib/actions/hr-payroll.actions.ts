'use server'

import { connectToDB } from '../mongoose';
import Staff from '../models/staff.models';
import SalaryRequest from '../models/salary-request.models';
import LeaveRequest from '../models/leave-request.models';
import Award from '../models/award.models';
import { getCurrentUser } from './auth.actions';

// Salary Request Actions
export async function createSalaryRequest(requestData: {
  amount: number;
  reason: string;
  requestDate: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    await connectToDB();

    const request = await SalaryRequest.create({
      staffId: currentUser.id,
      amount: requestData.amount,
      reason: requestData.reason,
      requestDate: new Date(requestData.requestDate),
    });

    return JSON.parse(JSON.stringify(request));
  } catch (error) {
    throw new Error('Failed to create salary request');
  }
}

export async function getSalaryRequests() {
  try {
    await connectToDB();
    
    const requests = await SalaryRequest.find({ del_flag: false })
      .populate('staffId', 'fullName')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map((request: any) => ({
      id: request._id.toString(),
      staffName: request.staffId?.fullName || 'Unknown',
      amount: request.amount,
      reason: request.reason,
      requestDate: new Date(request.requestDate).toLocaleDateString(),
      status: request.status,
      approvedBy: request.approvedBy?.fullName,
      createdAt: new Date(request.createdAt).toLocaleDateString(),
    }));

    return formattedRequests;
  } catch (error) {
    throw new Error('Failed to fetch salary requests');
  }
}

export async function updateSalaryRequestStatus(requestId: string, status: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    await connectToDB();

    const updateData: any = {
      status,
    };

    if (status === 'approved' || status === 'rejected') {
      updateData.approvedBy = currentUser.id;
      updateData.approvedAt = new Date();
    }

    await SalaryRequest.findByIdAndUpdate(requestId, updateData);

    return { success: true };
  } catch (error) {
    throw new Error('Failed to update salary request');
  }
}

// Leave Request Actions
export async function createLeaveRequest(requestData: {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    await connectToDB();

    const startDate = new Date(requestData.startDate);
    const endDate = new Date(requestData.endDate);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const request = await LeaveRequest.create({
      staffId: currentUser.id,
      leaveType: requestData.leaveType,
      startDate,
      endDate,
      days,
      reason: requestData.reason,
    });

    return JSON.parse(JSON.stringify(request));
  } catch (error) {
    throw new Error('Failed to create leave request');
  }
}

export async function getLeaveRequests() {
  try {
    await connectToDB();
    
    const requests = await LeaveRequest.find({ del_flag: false })
      .populate('staffId', 'fullName')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map((request: any) => ({
      id: request._id.toString(),
      staffName: request.staffId?.fullName || 'Unknown',
      leaveType: request.leaveType.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      startDate: new Date(request.startDate).toLocaleDateString(),
      endDate: new Date(request.endDate).toLocaleDateString(),
      days: request.days,
      reason: request.reason,
      status: request.status,
      approvedBy: request.approvedBy?.fullName,
      createdAt: new Date(request.createdAt).toLocaleDateString(),
    }));

    return formattedRequests;
  } catch (error) {
    throw new Error('Failed to fetch leave requests');
  }
}

export async function updateLeaveRequestStatus(requestId: string, status: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    await connectToDB();

    const updateData: any = {
      status,
    };

    if (status === 'approved' || status === 'rejected') {
      updateData.approvedBy = currentUser.id;
      updateData.approvedAt = new Date();
    }

    await LeaveRequest.findByIdAndUpdate(requestId, updateData);

    return { success: true };
  } catch (error) {
    throw new Error('Failed to update leave request');
  }
}

// Awards Actions
export async function createAward(awardData: {
  staffId: string;
  title: string;
  description: string;
  awardDate: string;
  amount?: number;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    await connectToDB();

    const award = await Award.create({
      ...awardData,
      awardDate: new Date(awardData.awardDate),
      amount: awardData.amount || 0,
      createdBy: currentUser.id,
    });

    return JSON.parse(JSON.stringify(award));
  } catch (error) {
    throw new Error('Failed to create award');
  }
}

export async function getAwards() {
  try {
    await connectToDB();
    
    const awards = await Award.find({ del_flag: false })
      .populate('staffId', 'fullName')
      .populate('createdBy', 'fullName')
      .sort({ createdAt: -1 });

    const formattedAwards = awards.map((award: any) => ({
      id: award._id.toString(),
      staffName: award.staffId?.fullName || 'Unknown',
      title: award.title,
      description: award.description,
      awardDate: new Date(award.awardDate).toLocaleDateString(),
      amount: award.amount,
      createdBy: award.createdBy?.fullName,
      createdAt: new Date(award.createdAt).toLocaleDateString(),
    }));

    return formattedAwards;
  } catch (error) {
    throw new Error('Failed to fetch awards');
  }
}

export async function deleteAward(awardId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error('Unauthorized');

    await connectToDB();

    await Award.findByIdAndUpdate(awardId, { del_flag: true });

    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete award');
  }
}