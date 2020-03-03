(() => {

    // get all data from sheet 4
    async function onSubmit(event) {
        event.preventDefault();

        const loading = document.querySelector('#loading');
        loading.classList.remove('hidden');

        const resultsDiv = document.querySelector('#results');
        resultsDiv.innerHTML = '';

        const response = await fetch('/api', {
            method: 'GET'
        });
        const json = await response.json();
        
        //const info = getParameters();
        //const response = await fetch(info.path, info.options);
        //const json = await response.json();

        $('#datatable').DataTable().destroy();
        //$('#datatable').DataTable().empty();

        $('#datatable').DataTable({
            dom: 'lBfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'print', 'colvis', //'pdf'
            ],
            
            data: json.註冊紀錄,
            columns: [{
                    data: '中心ID'
                },
                {
                    data: '姓名'
                },
                {
                    data: '身分證字號'
                },
                {
                    data: '學員證字號'
                },
                {
                    data: '樂齡學習中心名稱'
                },
                {
                    data: '拓點村里'
                },
                {
                    data: '課程ID'
                },
                {
                    data: '課程名稱'
                },
                {
                    data: '課程日期'
                },
                {
                    data: '簽到時間'
                },
                {
                    data: '簽退時間'
                },
                {
                    data: '時數'
                },

            ],

            // select search
            initComplete: function () {
                this.api().columns().every(function () {
                    var column = this;
                    var select = $('<select><option value=""></option></select>')
                        .appendTo($(column.footer()).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );
                            column
                                .search(val ? '^' + val + '$' : '', true, false)
                                .draw();
                        });
                    column.data().unique().sort().each(function (d, j) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    });
                });
            },
        });

        // text search
        $('input.global_filter').on('keyup click', function () {
            filterGlobal();
        });

        $('input.column_filter').on('keyup click', function () {
            filterColumn($(this).parents('tr').attr('data-column'));
        });

        resultsDiv.textContent = JSON.stringify(json, null, 2);
        //console.log(resultsDiv.textContent);

        //const resultsContainer = document.querySelector('#results-container');
        //resultsContainer.classList.remove('hidden');
        const datatable = document.querySelector('#datatable');
        datatable.classList.remove('hidden');

        const filterButtondiv = document.querySelector('#filterButtondiv');
        filterButtondiv.classList.remove('hidden');
        loading.classList.add('hidden');
    }


    function filterGlobal() {
        $('#datatable').DataTable().search(
            $('#global_filter').val(),
            $('#global_regex').prop('checked'),
            $('#global_smart').prop('checked')
        ).draw();
    }

    function filterColumn(i) {
        $('#datatable').DataTable().column(i).search(
            $('#col' + i + '_filter').val(),
            $('#col' + i + '_regex').prop('checked'),
            $('#col' + i + '_smart').prop('checked')
        ).draw();
    }

    async function changeFiltertable(event) {
        event.preventDefault();

        const filterTable = document.querySelector('#filterTable');
        if (filterTable.classList.contains('hidden')) {
            filterTable.classList.remove('hidden');
        } else {
            filterTable.classList.add('hidden');
        }
    }

    // custom post
    async function onPostform(event) {
        event.preventDefault();
        const path = '/api/customize';

        const options = {
            method: 'POST'
        };

        const bodyObj = {};

        const studentName = document.querySelector('.studentName')
        const studentID = document.querySelector('.studentID')
        const classDate = document.querySelector('.classDate')
        const signinTime = document.querySelector('.signinTime')
        const signoutTime = document.querySelector('.signoutTime')

        const centerName = document.querySelector('.centerName')
        const courseName = document.querySelector('.courseName')
        const spotName = document.querySelector('.spotName')

        bodyObj[studentName.name] = studentName.value.trim();
        bodyObj[studentID.name] = studentID.value.trim();
        bodyObj[classDate.name] = classDate.value.trim();
        bodyObj[signinTime.name] = signinTime.value.trim();
        bodyObj[signoutTime.name] = signoutTime.value.trim();
        bodyObj[centerName.name] = centerName.options[centerName.selectedIndex].value;
        bodyObj[courseName.name] = courseName.options[courseName.selectedIndex].value;
        bodyObj[spotName.name] = spotName.options[spotName.selectedIndex].value;

        //console.log(bodyObj);
        //input 3~10 10 is note
        //console.log(document.getElementsByTagName("input")[3].value);

        // transfer object to JSON and post
        if (bodyObj[studentName.name] && bodyObj[studentID.name] && bodyObj[classDate.name] &&
            bodyObj[signinTime.name] && bodyObj[signoutTime.name] &&
            bodyObj[centerName.name] && bodyObj[courseName.name]) {

            //button css
            const postButton = document.querySelector('#postButton');
            postButton.classList.add('hidden');
            const loadingButton = document.querySelector('#loadingButton3');
            loadingButton.classList.remove('hidden');

            options.body = JSON.stringify(bodyObj);
            options.headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            const response = await fetch(path, options);
            const json = await response.json();
            console.log(json);
            if (json.response == 'success') {
                const loadingButton = document.querySelector('#loadingButton3');
                loadingButton.classList.add('hidden');
                const successBadge = document.querySelector('#successBadge3');
                successBadge.classList.remove('hidden');
                studentName.value = '';
                studentID.value = '';
                const postButton = document.querySelector('#postButton');
                postButton.classList.remove('hidden');

                //fade out effect
                successBadge.classList.add('fade-out-btn')
                setTimeout(function () {
                    successBadge.classList.add('hidden')
                }, 1000);


            } else {
                const loadingButton = document.querySelector('#loadingButton3');
                loadingButton.classList.add('hidden');
                const failBadge = document.querySelector('#failBadge3');
                failBadge.classList.remove('hidden');
                studentName.value = '';
                studentID.value = '';
                const signInButton = document.querySelector('#postButton');
                signInButton.classList.remove('hidden');

                //fade out effect
                failBadge.classList.add('fade-out-btn')
                setTimeout(function () {
                    failBadge.classList.add('hidden')
                }, 1000);
            }
        }
        studentName.value = '';
        studentID.value = '';
    }

    async function signinForm(event) {
        event.preventDefault();

        const path = '/api';

        const options = {
            method: 'POST'
        };

        const bodyObj = {};

        const studentName = document.querySelector('.studentName1')
        const studentID = document.querySelector('.studentID1')
        const centerName = document.querySelector('.centerName1')
        const courseName = document.querySelector('.courseName1')
        const spotName = document.querySelector('.spotName1')

        bodyObj[studentName.name] = studentName.value.trim();
        bodyObj[studentID.name] = studentID.value.trim();

        bodyObj[centerName.name] = centerName.options[centerName.selectedIndex].value;
        bodyObj[courseName.name] = courseName.options[courseName.selectedIndex].value;
        bodyObj[spotName.name] = spotName.options[spotName.selectedIndex].value;

        // transfer object to JSON and post

        const bodySize = Object.keys(bodyObj).length;
        if (bodyObj[studentName.name] && bodyObj[studentID.name] &&
            bodyObj[centerName.name] && bodyObj[courseName.name] &&
            bodyObj[spotName.name]) {

            //button css
            const signInButton = document.querySelector('#signInButton');
            signInButton.classList.add('hidden');
            const loadingButton = document.querySelector('#loadingButton');
            loadingButton.classList.remove('hidden');


            options.body = JSON.stringify(bodyObj);
            options.headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            const response = await fetch(path, options);
            const json = await response.json();
            console.log(json);
            if (json.response == 'success') {
                const loadingButton = document.querySelector('#loadingButton');
                loadingButton.classList.add('hidden');
                const successBadge = document.querySelector('#successBadge');
                successBadge.classList.remove('hidden');
                studentName.value = '';
                studentID.value = '';
                const signInButton = document.querySelector('#signInButton');
                signInButton.classList.remove('hidden');

                //fade out effect
                successBadge.classList.add('fade-out-btn')
                setTimeout(function () {
                    successBadge.classList.add('hidden')
                }, 1000);


            } else {
                const loadingButton = document.querySelector('#loadingButton');
                loadingButton.classList.add('hidden');
                const failBadge = document.querySelector('#failBadge');
                failBadge.classList.remove('hidden');
                studentName.value = '';
                studentID.value = '';
                const signInButton = document.querySelector('#signInButton');
                signInButton.classList.remove('hidden');

                //fade out effect
                failBadge.classList.add('fade-out-btn')
                setTimeout(function () {
                    failBadge.classList.add('hidden')
                }, 1000);
            }
        }
        studentName.value = '';
        studentID.value = '';
    }

    async function signoutForm(event) {
        event.preventDefault();

        const path = '/api';
        const options = {
            method: 'PATCH'
        };

        const bodyObj = {};
        const studentName = document.querySelector('.studentName2')
        const studentID = document.querySelector('.studentID2')
        const centerName = document.querySelector('.centerName2')
        const courseName = document.querySelector('.courseName2')
        const spotName = document.querySelector('.spotName2')

        bodyObj[studentName.name] = studentName.value.trim();
        bodyObj[studentID.name] = studentID.value.trim();
        bodyObj[centerName.name] = centerName.options[centerName.selectedIndex].value;
        bodyObj[courseName.name] = courseName.options[courseName.selectedIndex].value;
        bodyObj[spotName.name] = spotName.options[spotName.selectedIndex].value;

        //console.log(bodyObj);
        // transfer object to JSON and post
        if (bodyObj[studentName.name] && bodyObj[studentID.name] &&
            bodyObj[centerName.name] && bodyObj[courseName.name] &&
            bodyObj[spotName.name]) {

            options.body = JSON.stringify(bodyObj);
            options.headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            //button css
            const signOutButton = document.querySelector('#signOutButton');
            signOutButton.classList.add('hidden');
            const loadingButton2 = document.querySelector('#loadingButton2');
            loadingButton2.classList.remove('hidden');

            const response = await fetch(path, options);
            const json = await response.json();
            console.log(json);

            //css effect
            //if success then clean the input
            if (json.response == 'success') {
                const loadingButton2 = document.querySelector('#loadingButton2');
                loadingButton2.classList.add('hidden');
                const successBadge2 = document.querySelector('#successBadge2');
                successBadge2.classList.remove('hidden');
                studentName.value = '';
                studentID.value = '';
                const signOutButton = document.querySelector('#signOutButton');
                signOutButton.classList.remove('hidden');

                //fade out effect
                successBadge2.classList.add('fade-out-btn')
                setTimeout(function () {
                    successBadge2.classList.add('hidden')
                }, 1000);


            } else {
                const loadingButton2 = document.querySelector('#loadingButton2');
                loadingButton2.classList.add('hidden');
                const failBadge2 = document.querySelector('#failBadge2');
                failBadge2.classList.remove('hidden');
                studentName.value = '';
                studentID.value = '';
                const signOutButton = document.querySelector('#signOutButton');
                signOutButton.classList.remove('hidden');

                //fade out effect
                failBadge2.classList.add('fade-out-btn')
                setTimeout(function () {
                    failBadge2.classList.add('hidden')
                }, 1000);
            }
        }
    }

    //show the info list dynamically from sheet
    async function appendSelectOption() {
        console.log('append');
        // show the course info list from sheet 5
        const response = await fetch('/api/5', {
            method: 'GET'
        });
        const json = await response.json();
        //console.log(json);
        //console.log(json.中心課程[0].課程名稱);

        for (let i = 0; i < json.中心課程.length; i++) {
            let option = document.createElement('option');
            option.text = json.中心課程[i].課程名稱;
            option.value = json.中心課程[i].課程名稱;
            let select = document.querySelector('.courseName');
            select.appendChild(option);

            let option1 = document.createElement('option');
            option1.text = json.中心課程[i].課程名稱;
            option1.value = json.中心課程[i].課程名稱;
            let select1 = document.querySelector('.courseName1');
            select1.appendChild(option1);

            let option2 = document.createElement('option');
            option2.text = json.中心課程[i].課程名稱;
            option2.value = json.中心課程[i].課程名稱;
            let select2 = document.querySelector('.courseName2');
            select2.appendChild(option2);
        }


        // show the course info list from sheet 2
        const response2 = await fetch('/api/2', {
            method: 'GET'
        });
        const json2 = await response2.json();
        //console.log(json2);

        //console.log(json2);
        //console.log(json2.樂齡中心資料[0].拓點村里);
        for (let i = 0; i < json2.樂齡中心資料.length; i++) {
            let optionn = document.createElement('option');
            optionn.text = json2.樂齡中心資料[i].樂齡學習中心名稱;
            optionn.value = json2.樂齡中心資料[i].樂齡學習中心名稱;
            document.querySelector('.centerName').appendChild(optionn);

            let optionn1 = document.createElement('option');
            optionn1.text = json2.樂齡中心資料[i].樂齡學習中心名稱;
            optionn1.value = json2.樂齡中心資料[i].樂齡學習中心名稱;
            document.querySelector('.centerName1').appendChild(optionn1);

            let optionn2 = document.createElement('option');
            optionn2.text = json2.樂齡中心資料[i].樂齡學習中心名稱;
            optionn2.value = json2.樂齡中心資料[i].樂齡學習中心名稱;
            document.querySelector('.centerName2').appendChild(optionn2);

            let option = document.createElement('option');
            option.text = json2.樂齡中心資料[i].拓點村里;
            option.value = json2.樂齡中心資料[i].拓點村里;
            document.querySelector('.spotName').appendChild(option);

            let option1 = document.createElement('option');
            option1.text = json2.樂齡中心資料[i].拓點村里;
            option1.value = json2.樂齡中心資料[i].拓點村里;
            document.querySelector('.spotName1').appendChild(option1);

            let option2 = document.createElement('option');
            option2.text = json2.樂齡中心資料[i].拓點村里;
            document.querySelector('.spotName2').appendChild(option2);
        }
    }

    async function showHome() {
        const section2 = document.querySelector('#section2');
        section2.classList.add('fade-out');
        section2.classList.remove('fade-in');
        setTimeout(function () {
            section2.classList.add('hidden')
        }, 300);

        const section1 = document.querySelector('#section1');
        section1.classList.add('fade-in');
        section1.classList.remove('fade-out');

        setTimeout(function () {
            section1.classList.remove('hidden')
        }, 400);

        //section1.classList.remove('hidden');
        //section2.classList.add('hidden');
    }

    async function showHistory() {
        /*const section1 = document.querySelector('#section1');
        section1.classList.add('hidden');
        const section2 = document.querySelector('#section2');
        section2.classList.remove('hidden');*/
        const section1 = document.querySelector('#section1');
        section1.classList.add('fade-out');
        section1.classList.remove('fade-in');
        setTimeout(function () {
            section1.classList.add('hidden')
        }, 300);

        const section2 = document.querySelector('#section2');
        section2.classList.add('fade-in');
        section2.classList.remove('fade-out');
        setTimeout(function () {
            section2.classList.remove('hidden')
        }, 400);
    }

    async function loadHistoryDatatable() {
        console.log('loadHistory');
        const response = await fetch(`/api/4/today`, {
            method: 'GET'
        });
        const json = await response.json();
        console.log(json);
        $('#datatable2').DataTable().destroy();

        $('#datatable2').DataTable({
            dom: 'lBfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'print', 'colvis',
            ],

            data: json.今日簽到紀錄,
            columns: [{
                    data: '姓名'
                },
                {
                    data: '學員證字號'
                },
                {
                    data: '樂齡學習中心名稱'
                },
                {
                    data: '拓點村里'
                },
                {
                    data: '課程名稱'
                },
                {
                    data: '課程日期'
                },
                {
                    data: '簽到時間'
                },
                {
                    data: '簽退時間'
                },
                {
                    data: '時數'
                },
            ],
        });
    }

    async function reloadHistory() {
        const section2 = document.querySelector('#section2');
        section2.classList.remove('fade-in');
        section2.classList.add('fade-out');
        setTimeout(function () {
            section2.classList.add('hidden')
        }, 400);

        await loadHistoryDatatable()

        section2.classList.remove('fade-out');
        section2.classList.remove('hidden')
        section2.classList.add('fade-in');
        //setTimeout(function () {
          //  section2.classList.remove('hidden')
        //}, 500);
    }

    const postButton = document.querySelector('#form-value');
    postButton.addEventListener('submit', onPostform);

    const signIn = document.querySelector('#sign-in-and-out');
    signIn.addEventListener('submit', signinForm);

    const signOut = document.querySelector("#sign-in-and-out1");
    signOut.addEventListener('submit', signoutForm);

    const filterButton = document.querySelector('#filterButton');
    filterButton.addEventListener('click', changeFiltertable);

    const form = document.querySelector('.fetchForm');
    form.addEventListener('submit', onSubmit);

    const navHome = document.querySelector('#navHome');
    navHome.addEventListener('click', showHome);

    const navHistory = document.querySelector('#navHistory');
    navHistory.addEventListener('click', showHistory);

    const reloadButton = document.querySelector('#reloadButton');
    reloadButton.addEventListener('click', reloadHistory);

    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

    appendSelectOption();
    loadHistoryDatatable();
    //createRequestPreview();

})();