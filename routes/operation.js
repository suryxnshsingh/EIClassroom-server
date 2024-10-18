const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

router.use(express.json());

const prisma = new PrismaClient();

router.post('/co-form', async (req, res) => {
  const { subjectCode,MST1_Q1, MST1_Q2, MST1_Q3, MST2_Q1, MST2_Q2, MST2_Q3, Quiz_Assignment } = req.body;

  try {
    const newSubmission = await prisma.cO.create({
      data: {
        subjectCode,
        MST1_Q1,
        MST1_Q2,
        MST1_Q3,
        MST2_Q1,
        MST2_Q2,
        MST2_Q3,
        Quiz_Assignment
      },
    });

    res.status(201).json(newSubmission);
  } catch (error) {
    console.error('Error submitting the form:', error);
    res.status(500).json({ error: 'Failed to submit the form' });
  }
});

// Route to create a new sheet entry
router.post('/submit-form', async (req, res) => {
  const { 
    id, 
    name, 
    subjectCode, 
    MST1_Q1, 
    MST1_Q2, 
    MST1_Q3, 
    MST2_Q1, 
    MST2_Q2, 
    MST2_Q3, 
    Quiz_Assignment, 
    EndSem_Q1, 
    EndSem_Q2, 
    EndSem_Q3, 
    EndSem_Q4, 
    EndSem_Q5 
  } = req.body;

  try {
    // Find the teacher based on subjectCode
    const subject = await prisma.subject.findUnique({
      where: {
        code: subjectCode,
      },
      include: {
        teacher: true, // Include the teacher data in the result
      },
    });

    if (!subject || !subject.teacher) {
      return res.status(404).json({ error: 'Subject or Teacher not found' });
    }

    // Create the new sheet and connect it with the subject and teacher
    await prisma.sheet.create({
      data: {
        id,
        name,
        subjectCode,
        teacherId: subject.teacher.id, // Dynamically connect teacher through subjectCode
        MST1_Q1: parseInt(MST1_Q1),
        MST1_Q2: parseInt(MST1_Q2),
        MST1_Q3: parseInt(MST1_Q3),
        MST2_Q1: parseInt(MST2_Q1),
        MST2_Q2: parseInt(MST2_Q2),
        MST2_Q3: parseInt(MST2_Q3),
        EndSem_Q1: parseInt(EndSem_Q1),
        EndSem_Q2: parseInt(EndSem_Q2),
        EndSem_Q3: parseInt(EndSem_Q3),
        EndSem_Q4: parseInt(EndSem_Q4),
        EndSem_Q5: parseInt(EndSem_Q5),
        Quiz_Assignment: parseInt(Quiz_Assignment)
      },
    });

    res.status(201).json({ message: 'Form data saved successfully' });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ error: 'Error saving form data' });
  }
});

// Route to get all rows from the Sheet table with a specific subjectCode
router.get('/sheets', async (req, res) => {
  const { subjectCode } = req.query; // Retrieve subjectCode from query parameter

  try {
    const sheets = await prisma.sheet.findMany({
      where: {
        subjectCode: subjectCode, // Filter records based on subjectCode
      },
    });
    res.status(200).json(sheets);
  } catch (error) {
    console.error('Error fetching sheets:', error);
    res.status(500).json({ error: 'Error fetching sheets' });
  }
});

// Route to update a specific sheet entry by ID and subjectCode
router.put('/sheets/:id/:subjectCode', async (req, res) => {
  const { id, subjectCode } = req.params;
  const {         
    name,
    MST1_Q1,
    MST1_Q2,
    MST1_Q3,
    MST2_Q1,
    MST2_Q2,
    MST2_Q3,
    Quiz_Assignment,
    EndSem_Q1,
    EndSem_Q2,
    EndSem_Q3,
    EndSem_Q4,
    EndSem_Q5 
  } = req.body;

  try {
    const updatedSheet = await prisma.sheet.update({
      where: {
        id_subjectCode: {
          id: id,
          subjectCode: subjectCode,
        },
      },
      data: {
        name,
        MST1_Q1,
        MST1_Q2,
        MST1_Q3,
        MST2_Q1,
        MST2_Q2,
        MST2_Q3,
        Quiz_Assignment,
        EndSem_Q1,
        EndSem_Q2,
        EndSem_Q3,
        EndSem_Q4,
        EndSem_Q5
      },
    });

    res.status(200).json(updatedSheet);
  } catch (error) {
    console.error('Error updating sheet:', error);
    res.status(500).json({ error: 'Error updating sheet' });
  }
});

const ExcelJS = require('exceljs');


router.get('/downloadmst1/:subjectCode', async (req, res) => {
    const { subjectCode } = req.params;
  
    try {
      // Fetch CO mappings from the CO table
      const coData = await prisma.cO.findUnique({
        where: { subjectCode },
      });
  
      if (!coData) {
        return res.status(404).json({ error: 'CO mapping not found for this subject' });
      }
  
      // Fetch student scores from the Sheet table
      const studentScores = await prisma.sheet.findMany({
        where: { subjectCode },
      });
  
      if (studentScores.length === 0) {
        return res.status(404).json({ error: 'No student scores found for this subject' });
      }
  
      // Create a new Excel workbook and sheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('CO Attainment');
  
      // Set column widths and headers
      worksheet.columns = [
        { header: 'Enrollment Number', key: 'enrollment', width: 20 },
        { header: 'Name', key: 'name', width: 30 },
        { header: `Q1-${coData.MST1_Q1}`, key: 'q1', width: 15 },
        { header: `Q2-${coData.MST1_Q2}`, key: 'q2', width: 15 },
        { header: `Q3-${coData.MST1_Q3}`, key: 'q3', width: 15 },
        { header: 'Total CO1', key: 'totalCO1', width: 15 },
        { header: 'Total CO2', key: 'totalCO2', width: 15 },
        { header: 'Total CO3', key: 'totalCO3', width: 15 },
        { header: 'Total CO4', key: 'totalCO4', width: 15 },
        { header: 'Total CO5', key: 'totalCO5', width: 15 }
      ];
  
    // Function to calculate CO totals for a student
      const calculateCOTotals = (student) => {
        const totals = {
          totalCO1: 0,
          totalCO2: 0,
          totalCO3: 0,
          totalCO4: 0,
          totalCO5: 0
        };
  
 // Function to add score to appropriate CO total
        const addScoreToCO = (coMapping, score) => {
          switch (coMapping) {
            case 'CO1': totals.totalCO1 += score || 0; break;
            case 'CO2': totals.totalCO2 += score || 0; break;
            case 'CO3': totals.totalCO3 += score || 0; break;
            case 'CO4': totals.totalCO4 += score || 0; break;
            case 'CO5': totals.totalCO5 += score || 0; break;
          }
        };
  
        // Map scores to their respective COs
        addScoreToCO(coData.MST1_Q1, student.MST1_Q1);
        addScoreToCO(coData.MST1_Q2, student.MST1_Q2);
        addScoreToCO(coData.MST1_Q3, student.MST1_Q3);
  
        return totals;
      };
  
      // Initialize grand totals for all COs
      const grandTotals = {
        totalCO1: 0,
        totalCO2: 0,
        totalCO3: 0,
        totalCO4: 0,
        totalCO5: 0
      };
  
      // Add rows for each student with their scores
      studentScores.forEach((student) => {
        const coTotals = calculateCOTotals(student);
        
        // Add to grand totals
        Object.keys(grandTotals).forEach(key => {
          grandTotals[key] += coTotals[key];
        });
  
        worksheet.addRow({
          enrollment: student.id,
          name: student.name,
          q1: student.MST1_Q1 || 0,
          q2: student.MST1_Q2 || 0,
          q3: student.MST1_Q3 || 0,
          ...coTotals
        });
      });
  
      const studentCount = studentScores.length;
      
      // Calculate averages for all COs
      const averages = {};
      Object.keys(grandTotals).forEach(key => {
        averages[key] = grandTotals[key] / studentCount;
      });
  
      // Add a row for average (target marks)
      worksheet.addRow({
        enrollment: 'Average (Target Marks)',
        ...averages
      });
  
      // Count students who achieved >= target marks for each CO
      const studentsAboveTarget = {
        totalCO1: 0,
        totalCO2: 0,
        totalCO3: 0,
        totalCO4: 0,
        totalCO5: 0
      };
  
      studentScores.forEach(student => {
        const coTotals = calculateCOTotals(student);
        Object.keys(studentsAboveTarget).forEach(key => {
          if (coTotals[key] >= averages[key]) {
            studentsAboveTarget[key]++;
          }
        });
      });
  
      // Add a row for students above target marks
      worksheet.addRow({
        enrollment: 'Students >= Target Marks',
        ...studentsAboveTarget
      });
  
      // Calculate percentages for all COs
      const percentages = {};
      Object.keys(studentsAboveTarget).forEach(key => {
        percentages[key] = `${((studentsAboveTarget[key] / studentCount) * 100).toFixed(2)}%`;
      });
  
      // Add a row for percentages
      worksheet.addRow({
        enrollment: 'Percentage',
        ...percentages
      });
  
      // Prepare the response with the generated Excel file
      const fileName = `CO_Attainment_${subjectCode}.xlsx`;
      res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  
      // Write the workbook to the response
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to generate the Excel sheet' });
    }
  });


  router.get('/downloadmst2/:subjectCode', async (req, res) => {
      const { subjectCode } = req.params;
    
      try {
        // Fetch CO mappings from the CO table
        const coData = await prisma.cO.findUnique({
          where: { subjectCode },
        });
    
        if (!coData) {
          return res.status(404).json({ error: 'CO mapping not found for this subject' });
        }
    
        // Fetch student scores from the Sheet table
        const studentScores = await prisma.sheet.findMany({
          where: { subjectCode },
        });
    
        if (studentScores.length === 0) {
          return res.status(404).json({ error: 'No student scores found for this subject' });
        }
    
        // Create a new Excel workbook and sheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('CO Attainment');
    
        // Set column widths and headers
        worksheet.columns = [
          { header: 'Enrollment Number', key: 'enrollment', width: 20 },
          { header: 'Name', key: 'name', width: 30 },
          { header: `Q1-${coData.MST2_Q1}`, key: 'q1', width: 15 },
          { header: `Q2-${coData.MST2_Q2}`, key: 'q2', width: 15 },
          { header: `Q3-${coData.MST2_Q3}`, key: 'q3', width: 15 },
          { header: 'Total CO1', key: 'totalCO1', width: 15 },
          { header: 'Total CO2', key: 'totalCO2', width: 15 },
          { header: 'Total CO3', key: 'totalCO3', width: 15 },
          { header: 'Total CO4', key: 'totalCO4', width: 15 },
          { header: 'Total CO5', key: 'totalCO5', width: 15 }
        ];
    
      // Function to calculate CO totals for a student
        const calculateCOTotals = (student) => {
          const totals = {
            totalCO1: 0,
            totalCO2: 0,
            totalCO3: 0,
            totalCO4: 0,
            totalCO5: 0
          };
    
   // Function to add score to appropriate CO total
          const addScoreToCO = (coMapping, score) => {
            switch (coMapping) {
              case 'CO1': totals.totalCO1 += score || 0; break;
              case 'CO2': totals.totalCO2 += score || 0; break;
              case 'CO3': totals.totalCO3 += score || 0; break;
              case 'CO4': totals.totalCO4 += score || 0; break;
              case 'CO5': totals.totalCO5 += score || 0; break;
            }
          };
    
          // Map scores to their respective COs
          addScoreToCO(coData.MST2_Q1, student.MST2_Q1);
          addScoreToCO(coData.MST2_Q2, student.MST2_Q2);
          addScoreToCO(coData.MST2_Q3, student.MST2_Q3);
    
          return totals;
        };
    
        // Initialize grand totals for all COs
        const grandTotals = {
          totalCO1: 0,
          totalCO2: 0,
          totalCO3: 0,
          totalCO4: 0,
          totalCO5: 0
        };
    
        // Add rows for each student with their scores
        studentScores.forEach((student) => {
          const coTotals = calculateCOTotals(student);
          
          // Add to grand totals
          Object.keys(grandTotals).forEach(key => {
            grandTotals[key] += coTotals[key];
          });
    
          worksheet.addRow({
            enrollment: student.id,
            name: student.name,
            q1: student.MST2_Q1 || 0,
            q2: student.MST2_Q2 || 0,
            q3: student.MST2_Q3 || 0,
            ...coTotals
          });
        });
    
        const studentCount = studentScores.length;
        
        // Calculate averages for all COs
        const averages = {};
        Object.keys(grandTotals).forEach(key => {
          averages[key] = grandTotals[key] / studentCount;
        });
    
        // Add a row for average (target marks)
        worksheet.addRow({
          enrollment: 'Average (Target Marks)',
          ...averages
        });
    
        // Count students who achieved >= target marks for each CO
        const studentsAboveTarget = {
          totalCO1: 0,
          totalCO2: 0,
          totalCO3: 0,
          totalCO4: 0,
          totalCO5: 0
        };
    
        studentScores.forEach(student => {
          const coTotals = calculateCOTotals(student);
          Object.keys(studentsAboveTarget).forEach(key => {
            if (coTotals[key] >= averages[key]) {
              studentsAboveTarget[key]++;
            }
          });
        });
    
        // Add a row for students above target marks
        worksheet.addRow({
          enrollment: 'Students >= Target Marks',
          ...studentsAboveTarget
        });
    
        // Calculate percentages for all COs
        const percentages = {};
        Object.keys(studentsAboveTarget).forEach(key => {
          percentages[key] = `${((studentsAboveTarget[key] / studentCount) * 100).toFixed(2)}%`;
        });
    
        // Add a row for percentages
        worksheet.addRow({
          enrollment: 'Percentage',
          ...percentages
        });
    
        // Prepare the response with the generated Excel file
        const fileName = `CO_Attainment_${subjectCode}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    
        // Write the workbook to the response
        await workbook.xlsx.write(res);
        res.end();
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate the Excel sheet' });
      }
    });

// Route to download an Excel sheet with calculations and averages
router.get('/download-sheets', async (req, res) => {
  const { subjectCode } = req.query; // Get subjectCode from query parameter

  try {
    // Fetch the subject details
    const subject = await prisma.subject.findUnique({
      where: { code: subjectCode },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    // Fetch the sheets for the specified subjectCode
    const sheets = await prisma.sheet.findMany({
      where: {
        subjectCode: subjectCode,
      },
    });

    if (sheets.length === 0) {
      return res.status(404).json({ error: 'No sheets found for this subject code.' });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet Data');

    // Add header rows
    worksheet.addRow(['Shri G. S. Institute of Tech. and Science']);
    worksheet.addRow(['Department of Electronics and Instrumentation Engineering']);
    worksheet.addRow([`Course Outcome Sheet for ${subjectCode}-${subject.name}`]);

    // Center align and merge the header rows
    for (let i = 1; i <= 3; i++) {
      worksheet.getRow(i).alignment = { horizontal: 'center' };
      worksheet.mergeCells(`A${i}:S${i}`);
    }

    // Add an empty row for spacing
    worksheet.addRow([]);

    // Add main header row
    worksheet.addRow([
      'Enrollment Number', 'Name', 'Subject Code', 'MST1_Q1', 'MST1_Q2', 'MST1_Q3', 'MST1_Total',
      'MST2_Q1', 'MST2_Q2', 'MST2_Q3', 'MST2_Total', 'MST_Best', 'Quiz/Assignment',
      'EndSem_Q1', 'EndSem_Q2', 'EndSem_Q3', 'EndSem_Q4', 'EndSem_Q5', 'EndSem_Total'
    ]);

    // Style the main header row
    worksheet.getRow(5).font = { bold: true };
    worksheet.getRow(5).alignment = { horizontal: 'center' };

    // Set column widths
    worksheet.columns = [
      { width: 20 }, { width: 30 }, { width: 15 },
      { width: 10 }, { width: 10 }, { width: 10 }, { width: 15 },
      { width: 10 }, { width: 10 }, { width: 10 }, { width: 15 },
      { width: 15 }, { width: 20 },
      { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 15 }
    ];

    // Add data rows with calculations for MST1_Total, MST2_Total, MST_Best, and EndSem_Total
    sheets.forEach((sheet) => {
      const MST1_Total = (sheet.MST1_Q1 || 0) + (sheet.MST1_Q2 || 0) + (sheet.MST1_Q3 || 0);
      const MST2_Total = (sheet.MST2_Q1 || 0) + (sheet.MST2_Q2 || 0) + (sheet.MST2_Q3 || 0);
      const MST_Best = Math.max(MST1_Total, MST2_Total);
      const EndSem_Total = (sheet.EndSem_Q1 || 0) + (sheet.EndSem_Q2 || 0) + (sheet.EndSem_Q3 || 0) + (sheet.EndSem_Q4 || 0) + (sheet.EndSem_Q5 || 0);

      worksheet.addRow([
        sheet.id, sheet.name, sheet.subjectCode,
        sheet.MST1_Q1, sheet.MST1_Q2, sheet.MST1_Q3, MST1_Total,
        sheet.MST2_Q1, sheet.MST2_Q2, sheet.MST2_Q3, MST2_Total,
        MST_Best, sheet.Quiz_Assignment,
        sheet.EndSem_Q1, sheet.EndSem_Q2, sheet.EndSem_Q3, sheet.EndSem_Q4, sheet.EndSem_Q5, EndSem_Total
      ]);
    });

    // Add the average row at the end of the data
    const lastRowNumber = worksheet.lastRow.number;
    const averageRow = worksheet.addRow(['Average']);
    averageRow.font = { bold: true };

    // Calculate averages for each column
    for (let col = 4; col <= 19; col++) {
      averageRow.getCell(col).value = { formula: `AVERAGE(${String.fromCharCode(64 + col)}6:${String.fromCharCode(64 + col)}${lastRowNumber})` };
    }

    // Set response headers for the download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sheets.xlsx');

    // Write the Excel file to the response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel sheet:', error);
    res.status(500).json({ error: 'Error generating Excel sheet' });
  }
});

module.exports = router;