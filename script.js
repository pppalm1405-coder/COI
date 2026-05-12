async function loadAdminActivities() {
    const searchVal = document.getElementById('searchInput') ? document.getElementById('searchInput').value.trim() : '';
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="text-center p-8">⏳ ประมวลผล...</td></tr>';

    try {
        // 🔴 แก้ไขแล้ว: ลบการดึงข้อมูลตารางที่ยังไม่ได้เชื่อมออกชั่วคราว
        let query = supabase.from('activities').select('*').order('created_at', { ascending: false });
        if (searchVal) query = query.ilike('studentId', `%${searchVal}%`);
        
        const { data, error } = await query;
        if (error) throw error;

        tbody.innerHTML = '';
        if (data.length === 0) return tbody.innerHTML = '<tr><td colspan="4" class="text-center p-8">ไม่พบรายการ</td></tr>';

        data.forEach((item) => {
            let filesHtml = item.files.map((f, i) => `<a href="${f.url}" target="_blank" class="text-primary text-xs hover:underline block mb-1">📄 เอกสาร ${i+1}</a>`).join('');
            
            let actionHtml = '';
            if (item.status === 'pending') {
                actionHtml = `
                    <button onclick="approveActivity('${item.id}')" class="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-full mb-1">✅ อนุมัติ</button>
                    <button onclick="openRejectModal('${item.id}')" class="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg w-full">❌ ปฏิเสธ</button>
                `;
            } else if (item.status === 'approved') {
                actionHtml = `<span class="text-green-600 font-bold text-sm">✔ อนุมัติแล้ว</span>`;
            } else {
                actionHtml = `<span class="text-red-600 font-bold text-sm">✖ ปฏิเสธแล้ว</span>`;
            }

            tbody.innerHTML += `
                <tr class="hover:bg-blue-50 border-b">
                    <td class="p-4 text-sm text-gray-800"><b>${item.studentId}</b><br>${item.studentName}</td>
                    <td class="p-4 text-sm font-bold">${item.actName} <span class="text-accent">(${item.act_hours || 0} ชม.)</span><br><span class="text-xs text-gray-500 font-normal">วันที่ทำ: ${item.actDate}</span></td>
                    <td class="p-4">${filesHtml}</td>
                    <td class="p-4 text-center align-middle">${actionHtml}</td>
                </tr>
            `;
        });
    } catch (error) { 
        console.error(error); 
        tbody.innerHTML = '<tr><td colspan="4" class="text-center p-8 text-red-500">เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล</td></tr>';
    }
}
