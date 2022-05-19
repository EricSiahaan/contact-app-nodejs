const express = require ('express');
const expressLayouts = require('express-ejs-layouts');
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContacts} = require ('./utils/contacts');
const {body, validationResult, check} = require ('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require ('connect-flash')
const res = require('express/lib/response');
const { required } = require('nodemon/lib/config');
const { redirect } = require('express/lib/response');
const app = express () ;
const port = 3000 ;


// gunakan ejs
app.set('view engine', 'ejs');
app.use(expressLayouts);


//Built-in middleware

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser('secret'));
app.use(session({
cookie : { maxAge : 6000},
secret:'secret',
resave:true,
saveUnitialized:true
})
);
app.use(flash());
app.use(express.json());



app.get ('/', (req, res) => {

     //res.sendFile ('./index.html', { root : __dirname }) ;
     const mahasiswa = [
         {
             nama : 'eric',
             email : 'eric@gnail.com'
         },
         {
             nama : 'Hansdeka',
             email : 'hansdeka@gmail.com'
         },
         {
             nama : 'siahaan',
             email : 'siahaan@gmail.com'
         }
     ]
     res.render('index', {
          nama : 'Eric', 
          title:'Halaman home',
          mahasiswa,
          layout:'layout/main-layout'
        
        })
});

app.get ('/about', (req, res, next) => {
    //res.sendFile ('./about.html', { root : __dirname }) ;
    res.render('about', {
        layout :'layout/main-layout',
    title :'Halamam about'})
    //next(); 

});

app.get ('/contact', (req, res) => {
    //res.sendFile ('./contact.html', { root : __dirname }) ;
    const contacts = loadContact();
    //console.log (contacts) ; 
    res.render('contact', { 
        layout :'layout/main-layout',
        title :'Halamam contact',
        contacts,  
        msg: req.flash('msg'),
    })
});

// Halmam form tambah data contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title : 'Form Tambah Data Contact',
        layout :'layout/main-layout',
    });
});


//proses Data Contact
app.post('/contact',[
    body('nama').custom((value) => {
        const duplikat = cekDuplikat(value);
        if(duplikat) {
            throw new Error('Nama Sudah Digunakan')
        }
        return true;
    }),
    check ('email', 'Email Tidak Valid').isEmail(),
    check('nohp', 'NOhp Tidak Valid').isMobilePhone('id-ID')
],(req,res)=> {
     const errors = validationResult(req);
     if (!errors.isEmpty()){
         //return res.status(400).json({ errors: errors.array()})
         res.render('add-contact', {
             title : 'Form Tambah Data Contact',
             layout: 'layout/main-layout',
             errors: errors.array(),

     })
    }else {
        //console.log(req.body);
     addContact(req.body);

     //kirimkan flash message
     req.flash('msg', 'Data Contact berhasil ditambahkan!!')
    res.redirect('/contact')
    
}}


);

//proses delete contact 
app.get('/contact/delete/:nama', (req, res) => {
    const contact = findContact(req.params.nama);

    // jika contact tidak ada
    if (!contact) {
        res.status(404);
        res.send('<h1>404</h1>')
    } else {
        deleteContact(req.params.nama);
        req.flash('msg', 'Data Contact berhasil dihapus!!')
    res.redirect('/contact')
    }
});

// Halmam form ubah data contact
app.get('/contact/edit/:nama', (req, res) => {
    const contact = findContact(req.params.nama);

    res.render('edit-contact', {
        title : 'Form Ubah Data Contact',
        layout :'layout/main-layout',
        contact,
    });
});

// proses ubah data
app.post('/contact/update',[
    body('nama').custom((value, { req }) => {
        const duplikat = cekDuplikat(value);
        if(value !== req.body.oldNama && duplikat) {
            throw new Error('Nama Sudah Digunakan')
        }
        return true;
    }),
    check ('email', 'Email Tidak Valid').isEmail(),
    check('nohp', 'NOhp Tidak Valid').isMobilePhone('id-ID')
],(req,res)=> {
     const errors = validationResult(req);
     if (!errors.isEmpty()){
         //return res.status(400).json({ errors: errors.array()})
         res.render('edit-contact', {
             title : 'Form ubah Data Contact',
             layout: 'layout/main-layout',
             errors: errors.array(),
             contact:req.body,

     })
    }else {
       
    //     //console.log(req.body);
     updateContacts(req.body);

     //kirimkan flash message
     req.flash('msg', 'Data Contact berhasil diubah!!')
    res.redirect('/contact')
    
}}


);



//Halaman detail contact
app.get ('/contact/:nama', (req, res) => {
    //res.sendFile ('./contact.html', { root : __dirname }) ;
     const contact = findContact(req.params.nama);
    //console.log (contacts) ; 
    res.render('detail', { 
        layout :'layout/main-layout',
        title :'Halamam contact',
         contact,
    })
});


app.use('/', (req, res) => {
    res.status(404);
    res.send('<h1>404<h1>');
})


app.listen(port, () => {
  console.log(`Server runnin on port ${port} ..`)
} )


