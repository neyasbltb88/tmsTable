/**
 *
 * @param params {Object}  keys: <br\>
 *    id: {string} Required - id of container
 *    col_names: {array} Required - array of column titles
 *    col: {array} Required - data model for data mapping
 */
tmsTable = function (params) {

    /**
     * table DOM id
     * @type {string}
     * @private
     */
    var _tbl_container_id = null

    /**
     * column titles
     * @type {Array}
     * @private
     */
    var _tbl_col_names = [];

    /**
     * identity map for columns and src data
     * @type {Array}
     * @private
     */
    var _tbl_cols = [];

    /**
     * data type array|jsonp
     * @type {string}
     * @private
     */
    var _tbl_dataType = null;

    /**
     * current page number
     * @type {number}
     * @private
     */
    var _tbl_page = 1;

    /**
     * total number of pages
     * @type {number}
     * @private
     */
    var _tbl_page_num = 1;

    /**
     * total rows number
     * @type {number}
     * @private
     */
    var _tbl_total = 0;

    /**
     * data rows
     * @type {Array}
     * @private
     */
    var _tbl_src = [];

    /**
     * result data to display
     * @type {Array}
     * @private
     */
    var _tbl_data = [];


    /**
     * CSS class
     * @type {string}
     * @private
     */
    var _tbl_class = '';

    /**
     * data url
     * @type {string}
     * @private
     */
    var _tbl_url = '';

    /**
     * Order direction asc|desc
     * @type {string}
     * @private
     */
    var _tbl_order_direction = 'asc';

    /**
     * Order by cell
     * @type {string}
     * @private
     */
    var _tbl_order_by = '';

    var _tbl_row_dblClick = function (rowId, rowData) {

    }
    var _tbl_row_click = function (rowId, rowData) {

    }

    var __table = null;
    var __thead = null;
    var __tbody = null;
    var __tfoot = null;
    var __select_page = null;
    var __span_pages = null;
    var __span_total = null;


    tmsTable.instances = [];


    this.constructor = function (params) {
        //console.log( "I'm mad! " );
        if (params === undefined) {
            throw ('params are not defined');
        }

        // checking of id
        if (params.id === undefined) {
            this.errorWrongId();
        } else {
            this.setId(params.id);
        }

        // checking of column names
        if (params.col_names === undefined || params.col_names === null || !Array.isArray(params.col_names)) {
            this.errorWrongColNames();
        } else {
            this.setColNames(params.col_names);
        }

        // checking data identity map
        if (params.cols === undefined || params.cols === null || !Array.isArray(params.cols)) {
            this.errorWrongCols();
        } else {
            this.setCols(params.cols);
        }

        if (params.order_by === undefined || params.order_by === null) {
            _tbl_order_by = _tbl_cols[0].index;
        } else {
            for (i = 0; i < _tbl_cols.length; i++) {
                if (params.order_by == _tbl_cols[i].index) {
                    _tbl_order_by = params.order_by;
                    break;
                }
            }
            if (_tbl_order_by == '')
                _tbl_order_by = _tbl_cols[0].index;


        }

        if (params.order_direction === undefined || params.order_direction === null) {
            _tbl_order_direction = 'asc';
        } else {
            if (params.order_direction == '')params.order_direction = 'asc';
            params.order_direction = params.order_direction.toLowerCase();
            if (params.order_direction != 'asc' && params.order_direction != 'desc') this.errorWrongOrderDirection();

            _tbl_order_direction = params.order_direction;
        }

        // checking for dataType
        if (params.dataType === undefined || params.dataType === null || Array.isArray(params.dataType)) {
            this.errorWrongDataType(1);
        } else {
            if (params.dataType != 'array' && params.dataType != 'jsonp') {
                this.errorWrongDataType();
            }
            this.setDataType(params.dataType);

            if (params.dataType == 'array') {
                // checking data src
                if (params.src === undefined || params.src === null || Array.isArray(params.src)) {
                    this.errorWrongDataSrc(1);
                } else {
                    this.setSrc(params.src);
                }
            }
            if (params.dataType == 'jsonp') {

                if (params.url === undefined || params.url == '') {
                    this.errorWrongUrl();
                }
                else {
                    this.setUrl(params.url);
                    this.loadRows();
                }

            }
        }


        if (params.class !== undefined && params.class != '') {
            this.setCssClassName(params.class);
        }

        if (params.click !== undefined) {
            _tbl_row_click = params.click;
        }
        if (params.dblClick !== undefined) {
            _tbl_row_dblClick = params.dblClick;
        }

        // add instance to collection of same type objects
        tmsTable.instances.push(this);
        return this;

    }

    /**
     * Set css classes for table
     * @param class_name
     * @returns {boolean}
     */
    this.setCssClassName = function (class_name) {
        if (class_name === undefined)this.errorWrongClass();

        if (class_name !== undefined && class_name != '') {
            _tbl_class = class_name;
            return true;
        }
        return false;
    }
    this.setUrl = function (url) {
        if (url === undefined)this.errorWrongUrl();

        if (url !== undefined && url != '') {
            _tbl_url = url;
            return true;
        }
        return false;
    }


    /**
     * set id of table container
     * @param id string
     * @returns {boolean}
     */
    this.setId = function (id) {
        if (id === undefined || id === null || id == '') {
            this.errorWrongId();
        }

        var table = $('#' + id);
        if (!table) {
            throw 'Table container with id #' + id + ' not found';
        }

        _tbl_container_id = id;
        return true;
    }


    /**
     * set table column titles
     * @param col_names array of strings
     * @returns {boolean}
     */
    this.setColNames = function (col_names) {
        if (col_names === undefined || col_names === null || !Array.isArray(col_names)) {
            this.errorWrongColNames();
        }

        _tbl_col_names = col_names;

        return true;
    }

    /**
     * Set src data type
     * @param dataType string  values:  array|jsonp
     * @returns {boolean}
     */
    this.setDataType = function (dataType) {
        if (dataType === undefined || dataType === null || Array.isArray(dataType)) {
            this.errorWrongDataType();
        } else {
            if (dataType != 'array' && dataType != 'jsonp') {
                this.errorWrongDataType();
            }
        }
        _tbl_dataType = dataType;
        return true;
    }

    this.setSrc = function (data) {
        if (data === undefined || data === null || Array.isArray(data)) {
            this.errorWrongDataSrc();
        } else {

            var r_num = /^[0-9]+$/;


            if (data.page === undefined || data.page === null || !r_num.test(data.page))this.errorWrongDataSrc('- page param');
            if (data.page_num === undefined || data.page_num === null || !r_num.test(data.page_num))this.errorWrongDataSrc('- page_num param');
            if (data.total === undefined || data.total === null || !r_num.test(data.total))this.errorWrongDataSrc('- total param');

            if (data.rows === undefined || data.rows === null || !Array.isArray(data.rows))this.errorWrongDataSrc('- rows param');

            _tbl_page = data.page;
            _tbl_page_num = data.page_num;
            _tbl_total = data.total;

            var rows = data.rows;
            rows_num = rows.length;


            cols_name_num = _tbl_col_names.length;
            if (!cols_name_num)this.errorWrongColNames(); // no column titles


            cols_num = _tbl_cols.length;
            if (!cols_num)this.errorWrongCols();

            if (cols_name_num != cols_num)this.errorWrongColsAndColsNamesNum()

            result = [];


            for (i = 0; i < rows_num; i++) {
                result_row = {};
                for (j = 0; j < cols_num; j++) {
                    var key = _tbl_cols[j].name;
                    if (rows[i][key] === undefined)this.errorUndefinedSrcIndex();
                    result_row[key] = rows[i][key];
                }
                result.push(result_row);
            }
            _tbl_data = null;
            _tbl_data = [];
            _tbl_data = result;
            return true;

        }
    }

    this.reloadRows = function () {
        if (_tbl_dataType == 'array') {
            __tbody.empty();
            this.reloadTBODY(__tbody);
            return true;
        }
        if (_tbl_dataType == 'jsonp') {

            this.loadRows();
            __tbody.empty();
            this.reloadTBODY(__tbody);

            __span_pages.text(_tbl_page_num);
            __span_total.text(_tbl_total);
            __select_page.val(_tbl_page);
            return true;
        }
        this.errorWrongDataType(_tbl_dataType);
        return false;
    }


    this.setCols = function (cols) {
        if (cols === undefined || cols === null || !Array.isArray(cols))this.errorWrongCols('- undefined | null | wrong type');
        var n = cols.length;
        if (!n)this.errorWrongCols('- zero length');
        for (i = 0; i < n; i++) {

            if (cols[i].index === undefined || cols[i].index === null || Array.isArray(cols[i].index) || cols[i].index == '')this.errorWrongCols('- index param');
            if (cols[i].name === undefined || cols[i].name === null || Array.isArray(cols[i].name) || cols[i].name == '')this.errorWrongCols('- name param');
            var width = null;
            if (cols[i].width !== undefined && cols[i].width !== null) {
                var r_num = /^[0-9]+$/;
                if (r_num.test(cols[i].width))
                    width = cols[i].width + 'px';
            }
            cols[i].width = width;

        }
        _tbl_cols = cols;
        return true;
    }

    /**
     * render result table view
     */
    this.render = function () {
        var this_object = this;
        if (_tbl_container_id === null)this.errorWrongId();

        var container = $('#' + _tbl_container_id);

        container.addClass('tmsTable tmsTable_container')
        var table_id = this.getTableId();
        __table = $('<table/>').attr('id', table_id);
        __table.addClass('tmsTable');
        if (_tbl_class != '') {
            __table.addClass(_tbl_class);
        }

        __thead = $('<thead/>');
        __table.append(__thead);

        var h_row = $('<tr/>');
        var columns_number = _tbl_col_names.length;
        for (i = 0; i < columns_number; i++) {
            var h_td = $('<th/>').text(_tbl_col_names[i]);

            if (_tbl_cols[i].width !== null) {
                h_td.css('width', _tbl_cols[i].width)
            }

            var sort = $('<span/>');
            var sort_asc = $('<span/>').addClass('orderasc').html('&uArr;');
            var sort_desc = $('<span/>').addClass('orderdesc').html('&dArr;');
            if (_tbl_order_by == _tbl_cols[i].index) {
                if (_tbl_order_direction == 'asc')
                    sort_desc.addClass('hidden');
                else
                    sort_asc.addClass('hidden');
            } else {
                sort_desc.addClass('hidden');
                sort_asc.addClass('hidden');
            }
            sort.append(sort_asc).append(sort_desc);

            h_td.attr('sidx', _tbl_cols[i].index).append(sort);
            h_td.bind('click', function () {
                this_object.orderBy($(this).attr('sidx'));
                h_row.find('.orderasc, .orderdesc').each(function () {
                    if (!$(this).hasClass('hidden'))$(this).addClass('hidden');
                });
                console.log('.order' + _tbl_order_direction + ':first');
                $(this).find('.order' + _tbl_order_direction + ':first').removeClass('hidden');
            })

            h_row.append(h_td);
        }
        __thead.append(h_row);

        __tbody = $('<tbody/>');

        this.reloadTBODY(__tbody);

        __table.append(__tbody)


        __tfoot = $('<tfoot/>');
        var tfoot_tr = $('<tr/>');
        var tfoot_td = $('<td/>').attr('colspan', columns_number);
        tfoot_tr.append(tfoot_td);
        __tfoot.append(tfoot_tr);

        __select_page = $('<input/>').val(_tbl_page).attr('type', 'text');
        __select_page.addClass('page_select');


        var a_refresh = $('<a/>').attr('class', 'table_refresh').text('Reload');
        tfoot_td.append(a_refresh);

        var a_gofirts = $('<a/>').addClass('gofirts');
        tfoot_td.append(a_gofirts);

        var a_goprevious = $('<a/>').addClass('goprevious');
        tfoot_td.append(a_goprevious);


        tfoot_td.append($('<label/>').text('Page:'));
        tfoot_td.append(__select_page);
        var label_pages = $('<label/>').html(' of: <span>' + _tbl_page_num + '</span>; ');
        __span_pages = label_pages.find('span:first');
        tfoot_td.append(label_pages);

        __span_total = $('<span/>').text(_tbl_total);
        tfoot_td.append($('<label/>').text(' Total records: ').append(__span_total));


        var a_gonext = $('<a/>').addClass('gonext');
        tfoot_td.append(a_gonext);

        var a_golast = $('<a/>').addClass('golast');
        tfoot_td.append(a_golast);

        __select_page.bind('change', function () {
            this_object.reloadRows()
        })
        a_refresh.bind('click', function () {
            this_object.reloadRows()
        })

        a_gofirts.bind('click', function () {
            this_object.goToPage(1);
        })
        a_golast.bind('click', function () {
            this_object.goToPage(_tbl_page_num);
        })
        a_gonext.bind('click', function () {
            this_object.goToPage(parseInt(_tbl_page) + 1);
        })
        a_goprevious.bind('click', function () {
            this_object.goToPage(parseInt(_tbl_page) - 1);
        })


        __table.append(__tfoot);
        container.append(__table);
    }

    this.goToPage = function (page) {

        if (page < 1)page = 1;
        if (page > _tbl_page_num)page = _tbl_page_num;

        __select_page.val(page);
        __select_page.change();
    }

    this.reloadTBODY = function (tbody) {
        n = _tbl_data.length;
        for (i = 0; i < n; i++) {
            var body_row = $('<tr/>');

            if (_tbl_row_dblClick !== null) {
                body_row.bind('dblclick', function () {
                    var rowId = $(this).index();
                    _tbl_row_dblClick(rowId, _tbl_data[rowId])
                });
            }
            if (_tbl_row_click !== null) {
                body_row.bind('click', function () {
                    var rowId = $(this).index();
                    _tbl_row_click(rowId, _tbl_data[rowId])
                });
            }

            for (var key in _tbl_data[i]) {
                td = $('<td/>');
                td.html(_tbl_data[i][key]);

                body_row.append(td);
            }

            tbody.append(body_row);
        }
    }

    /**
     * return name of table in selectcet container
     * @returns {string}
     */
    this.getTableId = function () {
        if (_tbl_container_id === null)this.errorWrongId();
        return 'tbl_' + _tbl_container_id;
    }


    this.loadRows = function () {
        if (_tbl_url == '')this.errorWrongUrl();

        thisobj = this;

        post_data = {};
        post_data.order_by = _tbl_order_by;
        post_data.order_dir = _tbl_order_direction;
        post_data.page = (__select_page === null ? 1 : __select_page.val());

        $.ajax({
            type: "POST",
            url: _tbl_url,
            dataType: 'json',
            data: post_data,
            async: false,
            statusCode: {
                404: function () {
                    throw 'page 404';
                }
                , 500: function () {
                    throw  'page 500';
                }
            }
            , success: function (response) {
                if (response.success != undefined && response.success) {
                    console.log(response);
                    thisobj.setSrc(response);
                }
                else {
                    if (response.msg !== undefined) {
                        throw response.msg;
                    }
                }
            }
            , complite: function () {
            }
        });
    }

    /**
     * change ordering of rows
     * @param order_by
     * @param direction
     */
    this.orderBy = function (order_by) {
        if (_tbl_order_by == order_by) {
            _tbl_order_direction = (_tbl_order_direction == 'asc' ? 'desc' : 'asc');
        } else {
            _tbl_order_by = order_by;
            _tbl_order_direction = 'asc';
        }
        this.reloadRows();
    }


    /**
     * throw error ID is not defined
     */
    this.errorWrongId = function () {
        throw 'Error: Invalid table ID';
    }

    /**
     * throw error Wrong css class
     */
    this.errorWrongClass = function () {
        throw 'Error: Invalid css class';
    }

    /**
     * throw error Worong column names
     */
    this.errorWrongColNames = function () {
        throw 'Error: Invalid Column Names';
    }

    /**
     * throw error Wrong data src
     */
    this.errorWrongDataSrc = function (text) {
        throw 'Error: Wrong data srs ' + (text === undefined ? '' : text);
    }

    /**
     * throw error Wrong src data type
     */
    this.errorWrongDataType = function (text) {
        throw 'Error: Wrong src Data type ' + (text === undefined ? '' : text);
    }

    /**
     * throw error wrong column model
     */
    this.errorWrongCols = function (text) {
        throw 'Error: Wrong column model ' + (text === undefined ? '' : text);
    }

    /**
     * throw error wrong url
     */
    this.errorWrongUrl = function () {
        throw 'Error: Wrong url';
    }

    /**
     * throw error number of column names isn`t equal ti number of columns in identity map
     */
    this.errorWrongColsAndColsNamesNum = function () {
        throw 'Error: number of column names isn`t equal ti number of columns in identity map';
    }
    this.errorUndefinedSrcIndex = function () {
        throw 'Error: Undefined index in Src data';
    }
    this.errorWrongOrderDirection = function () {
        throw 'Error: Wrong sort order';
    }

    this.constructor(params);


}