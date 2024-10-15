// Example using Express and Prisma
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

router.use(express.json());

const prisma = new PrismaClient();

router.post('/submit-form', async (req, res) => {
    const { name, subjectCode, teacherId, MST1, MST2, Quiz_Assignment, EndSem } = req.body;
  
    try {
      await prisma.sheet.create({
        data: {
          name,
          subjectCode,
          teacherId,
          MST1,
          MST2,
          Quiz_Assignment,
          EndSem,
        },
      });
  
      res.status(201).json({ message: 'Form data saved successfully' });
    } catch (error) {
      console.error('Error saving form data:', error);
      res.status(500).json({ error: 'Error saving form data' });
    }
  });

module.exports = router;